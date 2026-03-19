import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  charCount?: boolean;
}

export function Textarea({
  label,
  error,
  charCount = false,
  className = "",
  id,
  value,
  maxLength,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-text-muted"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        maxLength={maxLength}
        className={`neon-input w-full bg-surface border border-border text-text text-sm px-3 py-2.5 rounded-[var(--radius-md)] outline-none placeholder:text-text-dim resize-y min-h-[100px] ${
          error ? "border-red/50" : ""
        } ${className}`}
        {...props}
      />
      <div className="flex justify-between">
        {error && <p className="text-xs text-red">{error}</p>}
        {charCount && (
          <p className="text-xs text-text-dim ml-auto">
            {currentLength}
            {maxLength ? `/${maxLength}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
