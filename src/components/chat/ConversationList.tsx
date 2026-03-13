import { useTranslation } from "react-i18next";
import { PlusIcon, TrashIcon, ChatIcon } from "../ui/Icons";
import type { ChatConversation } from "../../types";

interface ConversationListProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* New chat button */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onNew}
          className="btn-press w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover hover:shadow-[var(--shadow-glow-accent)] text-white text-xs font-medium transition-all duration-300 cursor-pointer"
        >
          <PlusIcon size={14} />
          {t("chat.newChat")}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {conversations.map((conv) => {
          const active = activeId === conv.id;
          return (
            <div
              key={conv.id}
              className={`group flex items-center rounded-xl transition-all duration-200 ${
                active
                  ? "bg-accent-dim border border-accent/15 shadow-[var(--shadow-nav-active)]"
                  : "border border-transparent hover:bg-surface-hover hover:border-border"
              }`}
            >
              <button
                onClick={() => onSelect(conv.id)}
                className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
              >
                <ChatIcon
                  size={13}
                  className={`shrink-0 ${active ? "text-accent" : "text-text-dim"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${active ? "text-accent font-medium" : "text-text"}`}>
                    {conv.title ?? t("chat.untitled")}
                  </p>
                  <p className="text-[10px] text-text-dim mt-0.5 font-mono">
                    {formatRelativeDate(conv.updatedAt)}
                  </p>
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="shrink-0 p-1.5 mr-2 rounded-md opacity-0 group-hover:opacity-100 text-text-dim hover:text-red hover:bg-red-muted transition-all duration-150 cursor-pointer"
              >
                <TrashIcon size={12} />
              </button>
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-surface-hi border border-border flex items-center justify-center mb-3">
              <ChatIcon size={16} className="text-text-dim" />
            </div>
            <p className="text-xs text-text-dim">{t("chat.noConversations")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
