import { useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveAction } from "../../api/actions";
import { SendIcon, XIcon, FileTextIcon, CheckCircleIcon } from "../ui/Icons";
import type { PendingActionEvent } from "../../types";

interface PendingActionCardProps {
  action: PendingActionEvent;
}

export function PendingActionCard({ action }: PendingActionCardProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"pending" | "sending" | "done" | "cancelled" | "error">("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleApprove = async () => {
    setStatus("sending");
    try {
      const res = await resolveAction(action.actionId, true);
      setResultMessage((res as { data?: { message?: string } })?.data?.message ?? t("chat.action_approved"));
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("chat.action_error"));
      setStatus("error");
    }
  };

  const handleReject = async () => {
    setStatus("sending");
    try {
      await resolveAction(action.actionId, false);
      setStatus("cancelled");
    } catch {
      setStatus("cancelled"); // cancel is best-effort
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400">
        <CheckCircleIcon size={14} />
        <span>{resultMessage}</span>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-muted">
        <XIcon size={14} />
        <span>{t("chat.action_cancelled")}</span>
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
          onClick={handleApprove}
          className="btn-press px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors cursor-pointer"
        >
          {t("chat.action_retry")}
        </button>
      </div>
    );
  }

  // Render action-type-specific preview
  return (
    <div className="rounded-xl bg-surface border border-accent/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-accent-dim/50 border-b border-accent/10 flex items-center gap-2">
        <SendIcon size={14} className="text-accent" />
        <span className="text-xs font-medium text-accent">{getActionTitle(action.actionType, t)}</span>
      </div>

      {/* Preview */}
      <div className="px-4 py-3 space-y-1.5 text-xs">
        {action.actionType === "send-email" ? (
          <EmailPreview preview={action.preview} />
        ) : (
          <GenericPreview preview={action.preview} />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-border flex gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={status === "sending"}
          className="btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <CheckCircleIcon size={12} />
          {status === "sending" ? t("chat.action_processing") : getConfirmLabel(action.actionType, t)}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={status === "sending"}
          className="btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-hover hover:bg-surface-hi text-text-muted text-xs font-medium transition-colors cursor-pointer"
        >
          <XIcon size={12} />
          {t("chat.action_cancel")}
        </button>
      </div>
    </div>
  );
}

// ── Action-type-specific renderers ──────────────────────────────────────────

function EmailPreview({ preview }: { preview: Record<string, unknown> }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex gap-2">
        <span className="text-text-muted shrink-0">{t("chat.email_to")}:</span>
        <span className="text-text-bright font-medium">{String(preview["to"] ?? "")}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-text-muted shrink-0">{t("chat.email_subject")}:</span>
        <span className="text-text-bright">{String(preview["subject"] ?? "")}</span>
      </div>
      {preview["attachmentFilename"] && (
        <div className="flex items-center gap-2 mt-1">
          <FileTextIcon size={12} className="text-accent" />
          <span className="text-text-bright">{String(preview["attachmentFilename"])}</span>
        </div>
      )}
    </>
  );
}

function GenericPreview({ preview }: { preview: Record<string, unknown> }) {
  return (
    <>
      {Object.entries(preview).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="text-text-muted shrink-0">{key}:</span>
          <span className="text-text-bright">{String(value ?? "")}</span>
        </div>
      ))}
    </>
  );
}

// ── Label helpers ───────────────────────────────────────────────────────────

function getActionTitle(actionType: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    "send-email": t("chat.email_draft_title"),
    "create-event": t("chat.event_draft_title"),
  };
  return map[actionType] ?? t("chat.action_confirm_title");
}

function getConfirmLabel(actionType: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    "send-email": t("chat.email_send"),
    "create-event": t("chat.event_create"),
  };
  return map[actionType] ?? t("chat.action_confirm");
}
