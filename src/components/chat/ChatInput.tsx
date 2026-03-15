import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SendIcon, XIcon } from "../ui/Icons";

interface ChatInputProps {
  onSend: (query: string) => void;
  disabled: boolean;
  streaming: boolean;
  onStop: () => void;
}

export function ChatInput({ onSend, disabled, streaming, onStop }: ChatInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  // Restore focus when streaming ends
  useEffect(() => {
    if (!streaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [streaming]);

  return (
    <div className="px-4 py-4 bg-gradient-to-t from-bg via-bg to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 glass border border-border-hi/60 rounded-2xl px-4 py-3 shadow-[var(--shadow-card)] focus-within:border-accent/30 focus-within:shadow-[0_0_24px_rgba(59,130,246,0.08)] transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={t("chat.placeholder")}
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-bright placeholder:text-text-dim resize-none outline-none max-h-40 leading-relaxed"
          />
          {streaming ? (
            <button
              onClick={onStop}
              className="btn-press shrink-0 p-2.5 rounded-xl bg-red/10 text-red hover:bg-red/20 border border-red/15 transition-all duration-200 cursor-pointer hover:shadow-[0_0_16px_rgba(239,68,68,0.15)]"
              title={t("common.cancel")}
            >
              <XIcon size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className="btn-press shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer hover:shadow-[var(--shadow-glow-accent)] disabled:hover:shadow-none"
            >
              <SendIcon size={16} />
            </button>
          )}
        </div>
        <p className="text-[10px] text-text-dim text-center mt-2 font-mono">
          Enter ↵ {t("chat.sendHint")} · Shift+Enter {t("chat.newLineHint")}
        </p>
      </div>
    </div>
  );
}
