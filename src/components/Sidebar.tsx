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
  const { user, orgName, activeView, setActiveView, themeMode, setThemeMode } = useApp();
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
        style={{ animationDelay: `${staggerIndex * 0.05}s` }}
        className={`animate-slide-in-left w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer relative ${
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
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 flex-shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden transition-transform duration-300 ease-out md:translate-x-0 scanlines ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Gradient accent line at top */}
        <div className="gradient-bar h-[2px] shrink-0" />

        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-md)] flex items-center justify-center shadow-[var(--shadow-glow-accent)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]">
              <span className="text-white text-sm font-bold font-mono">
                {(orgName ?? user?.orgId ?? "H").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-text-bright tracking-tight font-mono glitch-hover truncate">
                {orgName ?? user?.orgId ?? "Agent"}
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-wider uppercase">
                agent
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {mainItems.map((item) => renderNavButton(item, ++stagger))}
          {adminItems.length > 0 && (
            <>
              <div className="border-t border-border mt-3 mb-2" />
              <p className="px-3 pt-1 pb-2 text-[11px] font-semibold tracking-[0.1em] text-text-muted uppercase font-mono">{t('nav.admin', 'Admin')}</p>
              {adminItems.map((item) => renderNavButton(item, ++stagger))}
            </>
          )}
          {superItems.length > 0 && (
            <>
              <div className="border-t border-border mt-3 mb-2" />
              <p className="px-3 pt-1 pb-2 text-[11px] font-semibold tracking-[0.1em] text-text-muted uppercase font-mono">{t('nav.platform', 'Platform')}</p>
              {superItems.map((item) => renderNavButton(item, ++stagger))}
            </>
          )}
        </nav>

        <div className="border-t border-border px-3 py-2.5 flex items-center gap-1.5">
          <button
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
            className="btn-press p-1.5 rounded-[var(--radius-sm)] text-text-muted hover:text-text hover:bg-surface-hover transition-all duration-300 cursor-pointer"
            title={themeMode === "dark" ? "Light mode" : "Dark mode"}
          >
            {themeMode === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          {([["en", "EN"], ["es", "ES"]] as const).map(([code, label]) => {
            const active = i18n.language.startsWith(code);
            return (
              <button
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className={`btn-press flex-1 font-mono text-[11px] font-semibold tracking-wider py-1.5 rounded-[var(--radius-sm)] transition-all duration-300 cursor-pointer ${
                  active
                    ? "bg-accent-dim text-accent shadow-[var(--shadow-nav-active)] border border-accent/20"
                    : "text-text-muted hover:text-text hover:bg-surface-hover border border-transparent"
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
                {orgName ?? user?.orgId}
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
