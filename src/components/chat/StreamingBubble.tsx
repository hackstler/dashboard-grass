import { useTranslation } from "react-i18next";
import { formatContent } from "../../utils/chat";
import { SourcesBadge } from "./SourcesBadge";
import { resolveToolLabel, resolveAgentLabel } from "../../hooks/useChatStream";
import { SearchIcon, FileTextIcon, DownloadIcon } from "../ui/Icons";
import { downloadBase64Pdf } from "../../utils/chat";
import type { ChatSource } from "../../types";
import type { PendingAttachment } from "../../hooks/useChatStream";

interface StreamingBubbleProps {
  content: string;
  sources: ChatSource[];
  activeTool: string | null;
  activeAgent: string | null;
  attachments: PendingAttachment[];
}

export function StreamingBubble({ content, sources, activeTool, activeAgent, attachments }: StreamingBubbleProps) {
  const { t } = useTranslation();

  // Resolve the activity label: prefer agent-level ("Generando presupuesto...")
  // over tool-level ("Calculando..."), since agent gives better high-level context.
  const activityLabel = activeAgent
    ? t(`chat.agent_${resolveAgentLabel(activeAgent)}`)
    : activeTool
      ? t(`chat.tool_${resolveToolLabel(activeTool)}`)
      : null;

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%] space-y-2">
        {sources.length > 0 && <SourcesBadge sources={sources} />}

        {/* PDF attachments received during streaming */}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {attachments.map((att, i) => (
              <button
                key={`att-${i}`}
                type="button"
                onClick={() => downloadBase64Pdf(att.base64, att.filename)}
                className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface border border-border-hi/60 text-xs text-text-bright hover:border-accent/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-accent-dim">
                  <FileTextIcon size={14} className="text-accent" />
                </div>
                <span className="truncate flex-1">{att.filename}</span>
                <DownloadIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Activity indicator — shown when a tool or sub-agent is running and no text yet */}
        {activityLabel && !content && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent-dim/50 border border-accent/10 text-xs text-accent animate-fade-in">
            <div className="relative shrink-0">
              <SearchIcon size={14} className="animate-pulse" />
              <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: "2s" }} />
            </div>
            <span>{activityLabel}</span>
            <span className="animate-shimmer inline-block w-8 h-2 rounded-full bg-accent/10" />
          </div>
        )}

        {/* Text content — only render bubble when there's actual content or loading dots */}
        {content ? (
          <div className="bg-surface border border-border-hi/60 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-text-bright shadow-[var(--shadow-card)]">
            <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
          </div>
        ) : !activityLabel ? (
          <div className="bg-surface border border-border-hi/60 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-text-bright shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "200ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "400ms" }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
