import { detectAttachments, formatContent, downloadBase64Pdf } from "../../utils/chat";
import { FileTextIcon, DownloadIcon } from "../ui/Icons";
import { PendingActionCard } from "./PendingActionCard";
import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { text, pdfs } = detectAttachments(message.content);
  const attachments = message.attachments ?? [];

  const linkStyle = `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
    isUser
      ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
      : "bg-surface-hi hover:bg-surface-hover text-text-bright border border-border hover:border-accent/30 hover:shadow-[0_0_16px_rgba(59,130,246,0.08)]"
  }`;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[80%] text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-accent to-accent-hover text-white rounded-2xl rounded-br-md px-4 py-3 shadow-[0_2px_12px_rgba(59,130,246,0.25)]"
            : "bg-surface border border-border-hi/60 border-t-accent/20 rounded-2xl rounded-bl-md px-4 py-3 shadow-[var(--shadow-card)]"
        }`}
      >
        {text && (
          <div
            className={isUser ? "text-white/95" : "text-text-bright"}
            dangerouslySetInnerHTML={{ __html: formatContent(text) }}
          />
        )}
        {message.pendingAction && (
          <div className="mt-3">
            <PendingActionCard action={message.pendingAction} />
          </div>
        )}
        {(pdfs.length > 0 || attachments.length > 0) && (
          <div className="mt-3 space-y-2">
            {pdfs.map((url, i) => (
              <a
                key={`url-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkStyle}
              >
                <div className={`p-1.5 rounded-lg ${isUser ? "bg-white/15" : "bg-accent-dim"}`}>
                  <FileTextIcon size={14} className={isUser ? "text-white" : "text-accent"} />
                </div>
                <span className="truncate flex-1">
                  {decodeURIComponent(url.split("/").pop() ?? "document.pdf")}
                </span>
                <DownloadIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
            {attachments.map((att, i) => (
              <button
                key={`att-${i}`}
                type="button"
                onClick={() => downloadBase64Pdf(att.base64, att.filename)}
                className={linkStyle}
              >
                <div className={`p-1.5 rounded-lg ${isUser ? "bg-white/15" : "bg-accent-dim"}`}>
                  <FileTextIcon size={14} className={isUser ? "text-white" : "text-accent"} />
                </div>
                <span className="truncate flex-1">{att.filename}</span>
                <DownloadIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
