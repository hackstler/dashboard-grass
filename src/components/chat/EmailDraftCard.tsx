import { useState } from "react";
import { useTranslation } from "react-i18next";
import { confirmEmailDraft } from "../../api/emails";
import { SendIcon, XIcon, FileTextIcon } from "../ui/Icons";
import type { EmailDraftPreview } from "../../types";

interface EmailDraftCardProps {
  draftId: string;
  preview: EmailDraftPreview;
}

export function EmailDraftCard({ draftId, preview }: EmailDraftCardProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"pending" | "sending" | "sent" | "cancelled" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus("sending");
    try {
      await confirmEmailDraft(draftId);
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("chat.email_send_error"));
      setStatus("error");
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
  };

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400">
        <SendIcon size={14} />
        <span>{t("chat.email_sent", { to: preview.to })}</span>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-muted">
        <XIcon size={14} />
        <span>{t("chat.email_cancelled")}</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <span>{errorMsg}</span>
        </div>
        <button
          type="button"
          onClick={handleSend}
          className="btn-press px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors cursor-pointer"
        >
          {t("chat.email_retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-accent/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-accent-dim/50 border-b border-accent/10 flex items-center gap-2">
        <SendIcon size={14} className="text-accent" />
        <span className="text-xs font-medium text-accent">{t("chat.email_draft_title")}</span>
      </div>

      {/* Preview */}
      <div className="px-4 py-3 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <span className="text-text-muted shrink-0">{t("chat.email_to")}:</span>
          <span className="text-text-bright font-medium">{preview.to}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-text-muted shrink-0">{t("chat.email_subject")}:</span>
          <span className="text-text-bright">{preview.subject}</span>
        </div>
        {preview.attachmentFilename && (
          <div className="flex items-center gap-2 mt-1">
            <FileTextIcon size={12} className="text-accent" />
            <span className="text-text-bright">{preview.attachmentFilename}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-border flex gap-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={status === "sending"}
          className="btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <SendIcon size={12} />
          {status === "sending" ? t("chat.email_sending") : t("chat.email_send")}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === "sending"}
          className="btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-hover hover:bg-surface-hi text-text-muted text-xs font-medium transition-colors cursor-pointer"
        >
          <XIcon size={12} />
          {t("chat.email_cancel")}
        </button>
      </div>
    </div>
  );
}
