import { useState, useCallback, useRef } from "react";
import { streamChat } from "../api/chat";
import type { ChatMessage, ChatSource, ChatStreamEvent, PendingActionEvent } from "../types";

export interface PendingAttachment {
  filename: string;
  base64: string;
}

export interface PendingMessage {
  id: string;
  role: "assistant";
  content: string;
  sources: ChatSource[];
  activeTool: string | null;
  /** Sub-agent currently executing (e.g. "agent-quote", "agent-rag") */
  activeAgent: string | null;
  attachments: PendingAttachment[];
  /** Action pending user confirmation (HITL) */
  pendingAction: PendingActionEvent | null;
}

interface SendResult {
  assistantMessage: ChatMessage | null;
  conversationId: string | null;
}

interface UseChatStreamReturn {
  pending: PendingMessage | null;
  streaming: boolean;
  error: string | null;
  sendMessage: (query: string, conversationId?: string) => Promise<SendResult>;
  stopStreaming: () => void;
  clearPending: () => void;
}

/** Maps tool names to semantic labels used by i18n (chat.tool_*) */
const TOOL_LABELS: Record<string, string> = {
  searchDocuments: "searching",
  calculateBudget: "generating_quote",
  saveNote: "saving",
  searchWeb: "searching_web",
};

/** Maps sub-agent IDs to semantic labels used by i18n (chat.agent_*) */
const AGENT_LABELS: Record<string, string> = {
  "agent-rag": "searching",
  "agent-quote": "generating_quote",
  "agent-youtube": "searching_youtube",
  "agent-gmail": "composing_email",
  "agent-calendar": "checking_calendar",
  "agent-catalog-manager": "consulting_catalog",
};

export function resolveToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? "thinking";
}

export function resolveAgentLabel(agentId: string): string {
  return AGENT_LABELS[agentId] ?? "thinking";
}

export function useChatStream(): UseChatStreamReturn {
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");
  const attachmentsRef = useRef<PendingAttachment[]>([]);

  const sendMessage = useCallback(async (
    query: string,
    conversationId?: string,
  ): Promise<SendResult> => {
    if (abortRef.current) return { assistantMessage: null, conversationId: null };

    const pendingId = `pending-${Date.now()}`;
    contentRef.current = "";
    attachmentsRef.current = [];
    setPending({ id: pendingId, role: "assistant", content: "", sources: [], activeTool: null, activeAgent: null, attachments: [], pendingAction: null });
    setStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    let resolvedConvId: string | null = conversationId ?? null;

    try {
      await streamChat(
        query,
        conversationId,
        (event: ChatStreamEvent) => {
          switch (event.type) {
            // ── Tool lifecycle ──────────────────────────────
            case "tool-call":
              // Mastra Supervisor Pattern emits tool-call with "agent-*" names for delegation
              if (event.toolName.startsWith("agent-")) {
                setPending((p) => p ? { ...p, activeAgent: event.toolName, activeTool: null } : p);
              } else {
                setPending((p) => p ? { ...p, activeTool: event.toolName } : p);
              }
              break;
            case "tool-error":
              // Tool failed — clear the active indicator
              setPending((p) => p ? { ...p, activeTool: null } : p);
              break;

            // ── Sub-agent delegation ────────────────────────
            case "agent-start":
              setPending((p) => p ? { ...p, activeAgent: event.agentId, activeTool: null } : p);
              break;
            case "agent-end":
              setPending((p) => p ? { ...p, activeAgent: null } : p);
              break;

            // ── LLM steps (clear tool indicator on step change) ─
            case "step-start":
              break;
            case "step-finish":
              setPending((p) => p ? { ...p, activeTool: null, activeAgent: null } : p);
              break;

            // ── Content ─────────────────────────────────────
            case "sources":
              setPending((p) => p ? { ...p, sources: event.chunks, activeTool: null } : p);
              break;
            case "text":
              contentRef.current += event.text;
              setPending((p) => p ? { ...p, content: contentRef.current, activeTool: null, activeAgent: null } : p);
              break;
            case "attachment":
              attachmentsRef.current = [...attachmentsRef.current, { filename: event.filename, base64: event.base64 }];
              setPending((p) => p ? { ...p, attachments: attachmentsRef.current } : p);
              break;
            case "pending-action":
              setPending((p) => p ? { ...p, pendingAction: { actionId: event.actionId, actionType: event.actionType, preview: event.preview } } : p);
              break;

            // ── Terminal ─────────────────────────────────────
            case "error":
              setError(event.message);
              break;
            case "done":
              break;
          }
        },
        (convId: string) => {
          resolvedConvId = convId;
        },
        controller.signal,
      );
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Stream failed");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      // Don't clear pending here — useChat will clear it after adding to messages
      // to avoid the flash where the message disappears and reappears.
    }

    const finalContent = contentRef.current;
    const hasAttachments = attachmentsRef.current.length > 0;
    if (!finalContent && !hasAttachments) {
      setPending(null);
      return { assistantMessage: null, conversationId: resolvedConvId };
    }

    // Capture pending action from the last pending state (it's React state, not a ref)
    let pendingAction: PendingActionEvent | null = null;
    setPending((p) => { pendingAction = p?.pendingAction ?? null; return p; });

    return {
      assistantMessage: {
        id: pendingId,
        role: "assistant",
        content: finalContent,
        metadata: null,
        attachments: attachmentsRef.current.length > 0 ? attachmentsRef.current : undefined,
        pendingAction: pendingAction ?? undefined,
        createdAt: new Date().toISOString(),
      },
      conversationId: resolvedConvId,
    };
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearPending = useCallback(() => {
    setPending(null);
  }, []);

  return { pending, streaming, error, sendMessage, stopStreaming, clearPending };
}
