import { apiRequest, BASE_URL } from "./http";
import type { ChatConversation, ChatMessage, ChatStreamEvent } from "../types";

// ── Conversations CRUD ──────────────────────────────────────────────────────

export async function listConversations(): Promise<ChatConversation[]> {
  return apiRequest<ChatConversation[]>("/conversations");
}

export async function getConversation(id: string): Promise<{
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}> {
  return apiRequest(`/conversations/${id}`);
}

export async function createConversation(title?: string): Promise<ChatConversation> {
  return apiRequest<ChatConversation>("/conversations", {
    method: "POST",
    body: { title },
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await apiRequest(`/conversations/${id}`, { method: "DELETE" });
}

// ── SSE Streaming ───────────────────────────────────────────────────────────

export function streamChat(
  query: string,
  conversationId: string | undefined,
  onEvent: (event: ChatStreamEvent) => void,
  onConversationId: (id: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem("auth_token");
  const params = new URLSearchParams({ query });
  if (conversationId) params.set("conversationId", conversationId);

  return fetch(`${BASE_URL}/chat/stream?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const convId = res.headers.get("X-Conversation-Id");
    if (convId) onConversationId(convId);

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6)) as ChatStreamEvent;
          onEvent(event);
        } catch {
          // ignore malformed lines
        }
      }
    }
  });
}
