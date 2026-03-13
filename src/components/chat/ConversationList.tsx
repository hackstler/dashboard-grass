import { useTranslation } from "react-i18next";
import { PlusIcon, TrashIcon } from "../ui/Icons";
import type { ChatConversation } from "../../types";

interface ConversationListProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
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
      <div className="px-3 py-3 border-b border-border">
        <button
          onClick={onNew}
          className="btn-press w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <PlusIcon size={14} />
          {t("chat.newChat")}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-1 rounded-lg transition-all duration-150 ${
              activeId === conv.id
                ? "bg-accent-dim text-accent"
                : "hover:bg-surface-hover text-text-muted"
            }`}
          >
            <button
              onClick={() => onSelect(conv.id)}
              className="flex-1 min-w-0 text-left px-3 py-2 text-xs truncate cursor-pointer"
            >
              {conv.title ?? t("chat.untitled")}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="shrink-0 p-1.5 mr-1 opacity-0 group-hover:opacity-100 text-text-dim hover:text-red transition-all cursor-pointer"
            >
              <TrashIcon size={12} />
            </button>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="text-xs text-text-dim text-center py-6">{t("chat.noConversations")}</p>
        )}
      </div>
    </div>
  );
}
