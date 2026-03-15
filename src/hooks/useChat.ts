import { useState, useCallback } from "react";
import { getConversation } from "../api/chat";
import { useConversations } from "./useConversations";
import { useChatStream } from "./useChatStream";
import type { ChatMessage } from "../types";

export function useChat() {
  const {
    conversations,
    loading: _conversationsLoading,
    error: conversationsError,
    fetchConversations,
    removeConversation: deleteConversation,
  } = useConversations();

  const {
    pending,
    streaming,
    error: streamError,
    sendMessage: streamSend,
    stopStreaming,
    clearPending,
  } = useChatStream();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const error = streamError ?? conversationsError;

  const selectConversation = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const conv = await getConversation(id);
      setActiveConversationId(id);
      setMessages(conv.messages);
    } catch {
      // conversation may have been deleted
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const removeConversation = useCallback(async (id: string) => {
    await deleteConversation(id);
    if (id === activeConversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId, deleteConversation]);

  const sendMessage = useCallback(async (query: string) => {
    if (streaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const result = await streamSend(query, activeConversationId ?? undefined);

    if (result.conversationId && result.conversationId !== activeConversationId) {
      setActiveConversationId(result.conversationId);
    }

    // Clear pending and add final message in the same tick — React batches
    // these into a single render, so the StreamingBubble disappears exactly
    // when the MessageBubble appears. No flash.
    if (result.assistantMessage) {
      setMessages((prev) => [...prev, result.assistantMessage!]);
    }
    clearPending();

    // Refresh sidebar in background
    fetchConversations();
  }, [streaming, activeConversationId, streamSend, clearPending, fetchConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    pending,
    streaming,
    loading,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
    removeConversation,
    stopStreaming,
    fetchConversations,
  };
}
