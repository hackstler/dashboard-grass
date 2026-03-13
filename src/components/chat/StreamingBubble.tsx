import { formatContent } from "../../utils/chat";
import { SourcesBadge } from "./SourcesBadge";
import type { ChatSource } from "../../types";

interface StreamingBubbleProps {
  content: string;
  sources: ChatSource[];
}

export function StreamingBubble({ content, sources }: StreamingBubbleProps) {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%] space-y-2">
        {sources.length > 0 && <SourcesBadge sources={sources} />}
        <div className="bg-surface border border-border rounded-xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed text-text-bright">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
          ) : (
            <div className="flex items-center gap-2 text-text-muted">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
