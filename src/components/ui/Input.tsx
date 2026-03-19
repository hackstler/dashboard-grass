import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-muted"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`neon-input w-full bg-surface border border-border text-text text-sm px-3 py-2.5 rounded-[var(--radius-md)] outline-none placeholder:text-text-muted ${
            icon ? "pl-9" : ""
          } ${error ? "border-red/50" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}
