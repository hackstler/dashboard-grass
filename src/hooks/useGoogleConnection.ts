import { useCallback } from "react";
import { usePolling } from "./usePolling";
import {
  getGoogleStatus,
  getGoogleAuthorizeUrl,
  disconnectGoogle,
} from "../api/google";
import type { GoogleConnectionStatus } from "../types";

interface UseGoogleConnectionReturn {
  status: GoogleConnectionStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useGoogleConnection(pollingInterval = 30000): UseGoogleConnectionReturn {
  const {
    data: status,
    loading,
    error,
    refetch,
  } = usePolling<GoogleConnectionStatus>(getGoogleStatus, pollingInterval);

  const connect = useCallback(async () => {
    const currentUrl = window.location.origin + window.location.pathname;
    const authorizeUrl = await getGoogleAuthorizeUrl(currentUrl);
    window.location.href = authorizeUrl;
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectGoogle();
    refetch();
  }, [refetch]);

  return {
    status,
    loading,
    error,
    refetch,
    connect,
    disconnect,
  };
}
