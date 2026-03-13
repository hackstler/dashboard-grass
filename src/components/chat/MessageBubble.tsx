import { detectAttachments, formatContent } from "../../utils/chat";
import { FileTextIcon } from "../ui/Icons";
import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { text, pdfs } = detectAttachments(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-white rounded-br-sm"
            : "bg-surface border border-border rounded-bl-sm"
        }`}
      >
        {text && (
          <div
            className={isUser ? "text-white" : "text-text-bright"}
            dangerouslySetInnerHTML={{ __html: formatContent(text) }}
          />
        )}
        {pdfs.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {pdfs.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isUser
                    ? "bg-white/15 hover:bg-white/25 text-white"
                    : "bg-surface-hi hover:bg-surface-hover text-accent border border-border"
                }`}
              >
                <FileTextIcon size={14} />
                <span className="truncate">
                  {decodeURIComponent(url.split("/").pop() ?? "document.pdf")}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
