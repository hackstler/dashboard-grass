import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DatabaseIcon } from "../ui/Icons";
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
        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-dim/50 border border-brand/10 hover:border-brand/20 text-text-muted hover:text-text transition-all duration-200 cursor-pointer"
      >
        <DatabaseIcon size={12} className="text-brand/60 group-hover:text-brand transition-colors" />
        <span>
          {sources.length} {t("chat.sources")}
        </span>
        <span className={`transition-transform duration-200 text-[10px] ${expanded ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5 animate-fade-in">
          {sources.map((s) => (
            <div
              key={s.id}
              className="bg-surface-hi/80 border border-border rounded-xl px-3.5 py-2.5 hover:border-border-hi transition-colors"
            >
              <p className="font-medium text-text-bright text-xs truncate">{s.documentTitle}</p>
              <p className="text-text-muted mt-1 line-clamp-2 text-[11px] leading-relaxed">{s.excerpt}</p>
              {s.score > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="h-1 flex-1 max-w-16 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-brand"
                      style={{ width: `${Math.round(s.score * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-dim font-mono">{Math.round(s.score * 100)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
