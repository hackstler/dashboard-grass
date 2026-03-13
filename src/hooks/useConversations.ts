import { useState, useCallback, useEffect } from "react";
import { listConversations, deleteConversation } from "../api/chat";
import type { ChatConversation } from "../types";

interface UseConversationsReturn {
  conversations: ChatConversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listConversations();
      setConversations(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const removeConversation = useCallback(async (id: string) => {
    const prev = conversations;
    setConversations((c) => c.filter((conv) => conv.id !== id));
    try {
      await deleteConversation(id);
    } catch (e) {
      setConversations(prev);
      setError(e instanceof Error ? e.message : "Failed to delete conversation");
    }
  }, [conversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, fetchConversations, removeConversation };
}
