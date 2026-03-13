import { useTranslation } from "react-i18next";
import { formatContent } from "../../utils/chat";
import { SourcesBadge } from "./SourcesBadge";
import { resolveToolLabel } from "../../hooks/useChatStream";
import { SearchIcon } from "../ui/Icons";
import type { ChatSource } from "../../types";

interface StreamingBubbleProps {
  content: string;
  sources: ChatSource[];
  activeTool: string | null;
}

export function StreamingBubble({ content, sources, activeTool }: StreamingBubbleProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%] space-y-2">
        {sources.length > 0 && <SourcesBadge sources={sources} />}

        {/* Tool activity indicator */}
        {activeTool && !content && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-accent-dim/50 border border-accent/10 text-xs text-accent animate-fade-in">
            <div className="relative shrink-0">
              <SearchIcon size={14} className="animate-pulse" />
              <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" style={{ animationDuration: "2s" }} />
            </div>
            <span>{t(`chat.tool_${resolveToolLabel(activeTool)}`)}</span>
            <span className="animate-shimmer inline-block w-8 h-2 rounded-full bg-accent/10" />
          </div>
        )}

        {/* Text content or loading dots */}
        <div className="glass border border-border-hi/60 rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-text-bright shadow-[var(--shadow-card)]">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
          ) : !activeTool ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "200ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "400ms" }} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
