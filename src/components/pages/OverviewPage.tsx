import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useChannels } from "../../hooks/useChannels";
import { useDocuments } from "../../hooks/useDocuments";
import { apiRequest } from "../../api/http";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useAnimatedCounter } from "../../hooks/useAnimatedCounter";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import {
  MessageCircleIcon,
  DatabaseIcon,
  BuildingIcon,
  TagIcon,
  UploadIcon,
  ChatIcon,
} from "../ui/Icons";

export function OverviewPage() {
  const { t } = useTranslation();
  const { user, setActiveView } = useApp();
  const { can } = usePermissions();
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.orgId) return;
    apiRequest<{ data: { name: string } | null }>("/org/me")
      .then((res) => setOrgName(res.data?.name ?? user.orgId))
      .catch(() => {});
  }, [user?.orgId]);
  const { catalogs, loading: catalogsLoading } = useCatalogs();
  const activeCatalog = catalogs.find((c) => c.isActive);
  const animatedCatalogCount = useAnimatedCounter(catalogs.length);

  const { status: waStatus, loading: waLoading } = useChannels(0);
  const { documents: docs, loading: docsLoading } = useDocuments({ pollingInterval: 0 });

  const totalDocs = docs.length;
  const indexedCount = docs.filter((d) => d.status === "indexed").length;
  const processingCount = docs.filter(
    (d) => d.status === "processing"
  ).length;

  const animatedTotal = useAnimatedCounter(totalDocs);
  const animatedIndexed = useAnimatedCounter(indexedCount);

  const waConnected = waStatus?.status === "connected";
  const waQr = waStatus?.status === "qr";
  const waPending = waStatus?.status === "pending";
  const waNotEnabled = waStatus?.status === "not_enabled";

  return (
    <div className="relative">
      {/* Ambient glow orbs */}
      <div className="ambient-orb w-[600px] h-[400px] bg-accent/[0.07] -top-32 -left-48" />
      <div className="ambient-orb w-[500px] h-[350px] bg-brand/[0.05] top-20 -right-40" />
      <div className="ambient-orb w-[300px] h-[200px] bg-brand-accent/[0.03] bottom-0 left-1/3" />

      {/* Header */}
      <div className="mb-10 animate-fade-in-up relative">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          {t(`overview.${new Date().getHours() < 12 ? "greetingMorning" : new Date().getHours() < 19 ? "greetingAfternoon" : "greetingEvening"}`)}
          {user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t('overview.subtitle')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
        {/* WhatsApp */}
        <div
          className="stat-card glow-card bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-1"
          style={
            {
              "--stat-accent": waConnected
                ? "#22c55e"
                : waQr || waPending
                  ? "#eab308"
                  : "#3b82f6",
              "--stat-glow": waConnected
                ? "rgba(34,197,94,0.15)"
                : waQr || waPending
                  ? "rgba(234,179,8,0.10)"
                  : "rgba(59,130,246,0.10)",
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-green-muted flex items-center justify-center">
              <MessageCircleIcon size={20} className="text-green" />
            </div>
            {waLoading && !waStatus ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge
                variant={
                  waConnected
                    ? "success"
                    : waQr || waPending
                      ? "warning"
                      : "default"
                }
                dot
                pulse={waConnected}
              >
                {waConnected
                  ? t('common.connected')
                  : waQr
                    ? t('overview.awaitingQR')
                    : waPending
                      ? t('overview.enabling')
                      : waNotEnabled
                        ? t('overview.notEnabled')
                        : t('common.disconnected')}
              </Badge>
            )}
          </div>
          <div className="mb-2">
            <p className="text-2xl sm:text-3xl font-bold text-text-bright tracking-tight">
              {waLoading && !waStatus ? (
                <Skeleton className="h-9 w-24 inline-block" />
              ) : waConnected ? (
                waStatus?.phone ?? t('common.active')
              ) : waPending ? (
                t('overview.enabling')
              ) : waNotEnabled ? (
                t('overview.notEnabled')
              ) : (
                t('overview.offline')
              )}
            </p>
          </div>
          <p className="text-xs text-text-muted mb-4">{t('overview.whatsappChannel')}</p>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5"
            onClick={() => setActiveView("whatsapp")}
          >
            {t('overview.manageChannel')} {'\u2192'}
          </Button>
        </div>

        {/* Knowledge Base */}
        {can("view_knowledge") && (
          <div
            className="stat-card glow-card bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-2"
            style={
              {
                "--stat-accent": "#3b82f6",
                "--stat-glow": "rgba(59,130,246,0.12)",
              } as React.CSSProperties
            }
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-accent-dim flex items-center justify-center">
                <DatabaseIcon size={20} className="text-accent" />
              </div>
              {docsLoading && docs.length === 0 ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge variant="info">{t('overview.indexed', { count: animatedIndexed })}</Badge>
              )}
            </div>
            <div className="mb-1">
              {docsLoading && docs.length === 0 ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold text-text-bright tracking-tight tabular-nums">
                  {animatedTotal}
                </p>
              )}
            </div>
            <p className="text-xs text-text-muted mb-4">
              {t('overview.documents')}
              {processingCount > 0 && (
                <span className="text-yellow ml-1">
                  &middot; {t('overview.processing', { count: processingCount })}
                </span>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2.5"
              onClick={() => setActiveView("knowledge-list")}
            >
              {t('overview.viewDocuments')} {'\u2192'}
            </Button>
          </div>
        )}

        {/* Organization */}
        <div
          className="stat-card glow-card bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-3"
          style={
            {
              "--stat-accent": "#8b5cf6",
              "--stat-glow": "rgba(139,92,246,0.12)",
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-brand/10 flex items-center justify-center">
              <BuildingIcon size={20} className="text-brand" />
            </div>
            <Badge variant={can("view_org_users") ? "info" : "default"}>
              {user?.role ?? "user"}
            </Badge>
          </div>
          <div className="mb-2">
            <p className="text-xl sm:text-3xl font-bold text-text-bright tracking-tight">
              {orgName || user?.orgId}
            </p>
          </div>
          <p className="text-xs text-text-muted font-mono mb-4">
            {orgName ? user?.orgId : t('overview.organization')}
          </p>
        </div>

        {/* Catalog */}
        {can("manage_catalogs") && (
          <div
            className="stat-card glow-card bg-surface border border-border rounded-[var(--radius-xl)] p-6 animate-fade-in-up stagger-4"
            style={
              {
                "--stat-accent": "#f59e0b",
                "--stat-glow": "rgba(245,158,11,0.12)",
              } as React.CSSProperties
            }
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-amber-500/10 flex items-center justify-center">
                <TagIcon size={20} className="text-amber-500" />
              </div>
              {catalogsLoading && catalogs.length === 0 ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <Badge variant={activeCatalog ? "success" : "default"}>
                  {activeCatalog?.name ?? t('overview.noActive')}
                </Badge>
              )}
            </div>
            <div className="mb-2">
              {catalogsLoading && catalogs.length === 0 ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold text-text-bright tracking-tight tabular-nums">
                  {animatedCatalogCount}
                </p>
              )}
            </div>
            <p className="text-xs text-text-muted mb-4">{t('overview.catalogs')}</p>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2.5"
              onClick={() => setActiveView("catalogs")}
            >
              {t('overview.viewCatalog')} {'\u2192'}
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up stagger-5">
        <h2 className="text-sm font-semibold text-text-bright mb-3">
          {t('overview.quickActions')}
        </h2>
        <div className="flex flex-wrap gap-3">
          {can("manage_knowledge") && (
            <Button
              variant="primary"
              icon={<UploadIcon size={16} />}
              onClick={() => setActiveView("knowledge-upload")}
            >
              {t('overview.uploadContent')}
            </Button>
          )}
          {can("use_chat") && (
            <Button
              variant="secondary"
              icon={<ChatIcon size={16} />}
              onClick={() => setActiveView("chat")}
            >
              {t('overview.startChat')}
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<MessageCircleIcon size={16} />}
            onClick={() => setActiveView("whatsapp")}
          >
            {t('overview.whatsappSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
}
