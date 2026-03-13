import { useTranslation } from "react-i18next";
import { ChatIcon } from "../ui/Icons";

export function EmptyChatState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-brand/10 border border-accent/15 flex items-center justify-center mb-4">
        <ChatIcon size={24} className="text-accent" />
      </div>
      <h2 className="text-lg font-semibold text-text-bright mb-1">{t("chat.title")}</h2>
      <p className="text-sm text-text-muted max-w-sm">{t("chat.emptyState")}</p>
    </div>
  );
}
