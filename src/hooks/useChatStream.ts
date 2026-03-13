import { useState, useCallback, useRef } from "react";
import { streamChat } from "../api/chat";
import type { ChatMessage, ChatSource, ChatStreamEvent } from "../types";

export interface PendingMessage {
  id: string;
  role: "assistant";
  content: string;
  sources: ChatSource[];
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
}

export function useChatStream(): UseChatStreamReturn {
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");

  const sendMessage = useCallback(async (
    query: string,
    conversationId?: string,
  ): Promise<SendResult> => {
    if (abortRef.current) return { assistantMessage: null, conversationId: null };

    const pendingId = `pending-${Date.now()}`;
    contentRef.current = "";
    setPending({ id: pendingId, role: "assistant", content: "", sources: [] });
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
            case "sources":
              setPending((p) => p ? { ...p, sources: event.chunks } : p);
              break;
            case "text":
              contentRef.current += event.text;
              setPending((p) => p ? { ...p, content: contentRef.current } : p);
              break;
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
      setPending(null);
    }

    const finalContent = contentRef.current;
    if (!finalContent) return { assistantMessage: null, conversationId: resolvedConvId };

    return {
      assistantMessage: {
        id: pendingId,
        role: "assistant",
        content: finalContent,
        metadata: null,
        createdAt: new Date().toISOString(),
      },
      conversationId: resolvedConvId,
    };
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { pending, streaming, error, sendMessage, stopStreaming };
}
