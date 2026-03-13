import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChatSource } from "../../types";

interface SourcesBadgeProps {
  sources: ChatSource[];
}

export function SourcesBadge({ sources }: SourcesBadgeProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors cursor-pointer"
      >
        <span className="w-4 h-4 rounded bg-accent-dim text-accent flex items-center justify-center text-[10px] font-bold">
          {sources.length}
        </span>
        {t("chat.sources")}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1 animate-fade-in">
          {sources.map((s) => (
            <div key={s.id} className="bg-surface-hi border border-border rounded-lg px-3 py-2">
              <p className="font-medium text-text-bright truncate">{s.documentTitle}</p>
              <p className="text-text-muted mt-0.5 line-clamp-2">{s.excerpt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
