import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { usePermissions } from "../hooks/usePermissions";
import { VIEW_PERMISSIONS } from "../permissions";
import type { ActiveView } from "../types";
import type { Permission } from "../permissions";
import {
  HomeIcon,
  ChatIcon,
  MessageCircleIcon,
  UploadIcon,
  DatabaseIcon,
  LogOutIcon,
  UsersIcon,
  BuildingIcon,
  TagIcon,
  SettingsIcon,
  FileTextIcon,
} from "./ui/Icons";
import type { ReactNode } from "react";

interface NavItem {
  id: ActiveView;
  labelKey: string;
  icon: ReactNode;
  requiredPermission?: Permission;
  section: "main" | "admin" | "super";
}

interface SidebarProps {
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ onLogout, mobileOpen, onMobileClose }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const { user, activeView, setActiveView } = useApp();
  const { can } = usePermissions();

  /**
   * Navigation items — requiredPermission is derived from VIEW_PERMISSIONS
   * where available, or set explicitly for items not in that map.
   */
  const allNavItems: NavItem[] = [
    { id: "overview", labelKey: "nav.overview", icon: <HomeIcon size={18} />, section: "main" },
    { id: "chat", labelKey: "nav.chat", icon: <ChatIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["chat"], section: "main" },
    { id: "whatsapp", labelKey: "nav.channels", icon: <MessageCircleIcon size={18} />, section: "main" },
    { id: "knowledge-upload", labelKey: "nav.upload", icon: <UploadIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["knowledge-upload"], section: "main" },
    { id: "knowledge-list", labelKey: "nav.knowledgeBase", icon: <DatabaseIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["knowledge-list"], section: "main" },
    { id: "quotes", labelKey: "nav.quotes", icon: <FileTextIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["quotes"], section: "main" },
    { id: "settings", labelKey: "nav.settings", icon: <SettingsIcon size={18} />, section: "main" },
    { id: "my-organization", labelKey: "nav.myOrganization", icon: <BuildingIcon size={18} />, requiredPermission: "view_own_org", section: "main" },
    { id: "users", labelKey: "nav.users", icon: <UsersIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["users"], section: "admin" },
    { id: "catalogs", labelKey: "nav.catalog", icon: <TagIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["catalogs"], section: "admin" },
    { id: "organizations", labelKey: "nav.organizations", icon: <BuildingIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["organizations"], section: "super" },
    { id: "whatsapp-connections", labelKey: "nav.whatsappMgmt", icon: <MessageCircleIcon size={18} />, requiredPermission: VIEW_PERMISSIONS["whatsapp-connections"], section: "super" },
  ];

  const visibleItems = allNavItems.filter((item) => {
    return !item.requiredPermission || can(item.requiredPermission);
  });

  const mainItems = visibleItems.filter((item) => item.section === "main");
  const adminItems = visibleItems.filter((item) => item.section === "admin");
  const superItems = visibleItems.filter((item) => item.section === "super");

  const handleNav = (view: ActiveView) => {
    setActiveView(view);
    onMobileClose();
  };

  const renderNavButton = (item: NavItem, staggerIndex: number) => {
    const active = activeView === item.id;
    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className={`animate-slide-in-left stagger-${staggerIndex} w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer relative ${
          active
            ? "bg-accent-dim text-accent font-medium shadow-[var(--shadow-nav-active)] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:bg-accent before:rounded-full before:shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            : "text-text-muted hover:bg-surface-hover hover:text-text hover:translate-x-0.5"
        }`}
      >
        <span className={`shrink-0 transition-transform duration-200 ${active ? "scale-110" : ""}`}>
          {item.icon}
        </span>
        {t(item.labelKey)}
      </button>
    );
  };

  let stagger = 0;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 flex-shrink-0 glass border-r border-border flex flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Gradient accent line at top */}
        <div className="gradient-bar h-[2px] shrink-0" />

        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-md)] flex items-center justify-center shadow-[var(--shadow-glow-accent)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-sm gradient-text tracking-tight">
              {t('nav.agentDashboard')}
            </span>
          </div>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {mainItems.map((item) => renderNavButton(item, ++stagger))}
          {adminItems.length > 0 && (
            <>
              <div className="border-t border-border my-2" />
              {adminItems.map((item) => renderNavButton(item, ++stagger))}
            </>
          )}
          {superItems.length > 0 && (
            <>
              <div className="border-t border-border my-2" />
              {superItems.map((item) => renderNavButton(item, ++stagger))}
            </>
          )}
        </nav>

        <div className="border-t border-border px-3 py-2.5 flex gap-1.5">
          {([["en", "EN"], ["es", "ES"]] as const).map(([code, label]) => {
            const active = i18n.language.startsWith(code);
            return (
              <button
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className={`btn-press flex-1 font-mono text-[11px] font-semibold tracking-wider py-1.5 rounded-[var(--radius-sm)] transition-all duration-300 cursor-pointer ${
                  active
                    ? "bg-accent-dim text-accent shadow-[var(--shadow-nav-active)] border border-accent/20"
                    : "text-text-dim hover:text-text-muted hover:bg-surface-hover border border-transparent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="border-t border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => handleNav("profile")}
            className="flex items-center gap-3 flex-1 min-w-0 rounded-[var(--radius-md)] p-1 -m-1 hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-xs font-semibold text-accent select-none shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-bright font-medium truncate text-left">
                {user?.name ? (user.surname ? `${user.name} ${user.surname}` : user.name) : user?.email}
              </p>
              <p className="text-xs text-text-dim truncate font-mono text-left">
                {user?.orgId}
              </p>
            </div>
          </button>
          <button
            onClick={onLogout}
            className="btn-press text-text-dim hover:text-red transition-colors cursor-pointer p-1.5 rounded-[var(--radius-sm)] hover:bg-red-muted"
            title={t('common.logout')}
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
