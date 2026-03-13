import { useState, useRef } from "react";
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

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="flex items-end gap-2 bg-surface border border-border rounded-xl px-3 py-2 focus-within:border-accent/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={t("chat.placeholder")}
          rows={1}
          className="flex-1 bg-transparent text-sm text-text-bright placeholder:text-text-dim resize-none outline-none max-h-40 leading-relaxed"
          disabled={disabled}
        />
        {streaming ? (
          <button
            onClick={onStop}
            className="btn-press shrink-0 p-2 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-colors cursor-pointer"
          >
            <XIcon size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="btn-press shrink-0 p-2 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <SendIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
