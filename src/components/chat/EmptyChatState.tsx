import { useTranslation } from "react-i18next";
import { SearchIcon, FileTextIcon, MessageCircleIcon } from "../ui/Icons";

interface EmptyChatStateProps {
  onSuggestionClick?: (text: string) => void;
}

export function EmptyChatState({ onSuggestionClick }: EmptyChatStateProps) {
  const { t } = useTranslation();

  const suggestions = [
    { icon: <SearchIcon size={16} />, labelKey: "chat.suggestionSearch", promptKey: "chat.suggestionSearchPrompt" },
    { icon: <FileTextIcon size={16} />, labelKey: "chat.suggestionQuote", promptKey: "chat.suggestionQuotePrompt" },
    { icon: <MessageCircleIcon size={16} />, labelKey: "chat.suggestionAsk", promptKey: "chat.suggestionAskPrompt" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in-up">
      {/* Dramatic ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-accent/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-72 h-72 rounded-full bg-brand/[0.04] blur-[100px] pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* Hackstler terminal prompt */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-brand/15 border border-accent/20 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.15)] animate-[float_4s_ease-in-out_infinite]">
          <span className="text-3xl font-bold gradient-text font-mono">H</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green border-2 border-bg flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.3)]">
          <span className="w-2.5 h-2.5 rounded-full bg-white pulse-dot" />
        </div>
      </div>

      {/* Terminal-style greeting */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-bright mb-3 tracking-tight">
          {t("chat.title")}
        </h2>
        <p className="text-sm text-text-muted max-w-md leading-relaxed">
          {t("chat.emptyState")}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-accent/50 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
          <span>hackstler agent online</span>
        </div>
      </div>

      {/* Suggestion chips — bigger, more visual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full">
        {suggestions.map((s) => (
          <button
            key={s.labelKey}
            type="button"
            onClick={() => onSuggestionClick?.(t(s.promptKey))}
            className="btn-press group flex items-center gap-3 px-5 py-4 rounded-xl bg-surface border border-border hover:border-accent/30 hover:bg-surface-hover hover:shadow-[0_0_24px_rgba(59,130,246,0.08)] transition-all duration-300 text-sm text-text-muted hover:text-text cursor-pointer text-left"
          >
            <div className="p-2 rounded-lg bg-accent-dim group-hover:bg-accent/15 transition-colors duration-300">
              <span className="text-accent">{s.icon}</span>
            </div>
            <span className="font-medium">{t(s.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
