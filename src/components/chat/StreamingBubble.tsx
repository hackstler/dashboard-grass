import { useTranslation } from "react-i18next";
import { formatContent } from "../../utils/chat";
import { SourcesBadge } from "./SourcesBadge";
import { resolveToolLabel, resolveAgentLabel } from "../../hooks/useChatStream";
import { SearchIcon } from "../ui/Icons";
import type { ChatSource } from "../../types";

interface StreamingBubbleProps {
  content: string;
  sources: ChatSource[];
  activeTool: string | null;
  activeAgent: string | null;
}

export function StreamingBubble({ content, sources, activeTool, activeAgent }: StreamingBubbleProps) {
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
          <div className="glass border border-border-hi/60 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-text-bright shadow-[var(--shadow-card)]">
            <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
          </div>
        ) : !activityLabel ? (
          <div className="glass border border-border-hi/60 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-text-bright shadow-[var(--shadow-card)]">
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
