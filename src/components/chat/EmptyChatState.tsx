import { useTranslation } from "react-i18next";
import { ChatIcon, SearchIcon, FileTextIcon, MessageCircleIcon } from "../ui/Icons";

export function EmptyChatState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in-up">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/15 to-brand/10 border border-accent/10 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.1)]">
          <ChatIcon size={32} className="text-accent" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green border-2 border-bg flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-text-bright mb-2">{t("chat.title")}</h2>
      <p className="text-sm text-text-muted max-w-md mb-8 leading-relaxed">{t("chat.emptyState")}</p>

      {/* Suggestion chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full">
        {[
          { icon: <SearchIcon size={14} />, labelKey: "chat.suggestionSearch" },
          { icon: <FileTextIcon size={14} />, labelKey: "chat.suggestionQuote" },
          { icon: <MessageCircleIcon size={14} />, labelKey: "chat.suggestionAsk" },
        ].map((s) => (
          <div
            key={s.labelKey}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface/80 border border-border hover:border-border-hi hover:bg-surface-hover transition-all duration-200 text-xs text-text-muted"
          >
            <span className="text-accent/60">{s.icon}</span>
            {t(s.labelKey)}
          </div>
        ))}
      </div>
    </div>
  );
}
