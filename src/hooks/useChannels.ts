import { useCallback } from "react";
import { usePolling } from "./usePolling";
import {
  getWhatsappStatus,
  getWhatsappQr,
  getWhatsappPairingCode,
  enableWhatsapp,
  disconnectWhatsapp,
} from "../api/channels";
import type { WhatsAppStatus } from "../types";

interface UseChannelsReturn {
  status: WhatsAppStatus | null;
  qrData: string | null;
  pairingCode: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  enable: (linkingMethod?: "qr" | "code", phoneNumber?: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useChannels(pollingInterval = 15000): UseChannelsReturn {
  const {
    data: status,
    loading,
    error,
    refetch,
  } = usePolling<WhatsAppStatus>(getWhatsappStatus, pollingInterval);

  const isQrPhase = status?.status === "qr";
  const { data: qrData } = usePolling<string | null>(
    getWhatsappQr,
    pollingInterval,
    isQrPhase,
  );

  const isCodePhase = status?.status === "code";
  const { data: pairingCode } = usePolling<string | null>(
    getWhatsappPairingCode,
    pollingInterval,
    isCodePhase,
  );

  const enable = useCallback(
    async (linkingMethod?: "qr" | "code", phoneNumber?: string) => {
      await enableWhatsapp(linkingMethod, phoneNumber);
      refetch();
    },
    [refetch],
  );

  const disconnect = useCallback(async () => {
    await disconnectWhatsapp();
    refetch();
  }, [refetch]);

  return {
    status,
    qrData,
    pairingCode,
    loading,
    error,
    refetch,
    enable,
    disconnect,
  };
}
