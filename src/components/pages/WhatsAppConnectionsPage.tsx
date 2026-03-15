import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { useApp } from "../../context/AppContext";
import { getWhatsappConnections, revokeWhatsappConnection } from "../../api/admin";
import type { WhatsAppConnection } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Modal } from "../ui/Modal";
import { MessageCircleIcon } from "../ui/Icons";

function statusBadge(status: string) {
  switch (status) {
    case "connected":
      return <Badge variant="success">{i18n.t('common.connected')}</Badge>;
    case "qr":
    case "pending":
      return <Badge variant="warning">{status === "qr" ? i18n.t('whatsapp.awaitingScan') : i18n.t('common.pending')}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export function WhatsAppConnectionsPage() {
  const { t } = useTranslation();
  const { user, addToast } = useApp();
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<WhatsAppConnection | null>(null);

  const isSuperAdmin = user?.role === "super_admin";

  const fetchConnections = useCallback(async () => {
    try {
      const data = await getWhatsappConnections();
      setConnections(data);
    } catch {
      addToast(t('whatsappConnections.loadFailed'), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 30_000);
    return () => clearInterval(interval);
  }, [fetchConnections]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(revokeTarget.userId);
    try {
      await revokeWhatsappConnection(revokeTarget.userId);
      addToast(t('whatsappConnections.sessionRevoked'), "success");
      setRevokeTarget(null);
      await fetchConnections();
    } catch {
      addToast(t('whatsappConnections.revokeFailed'), "error");
    } finally {
      setRevoking(null);
    }
  };

  const activeConnections = connections.filter((c) => c.status !== "disconnected");

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 flex items-center gap-4"
          >
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('whatsappConnections.title')}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('whatsappConnections.subtitle')}{isSuperAdmin ? t('whatsappConnections.subtitleAllOrgs') : ""}.
          </p>
        </div>
      </div>

      {activeConnections.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageCircleIcon size={40} />}
            title={t('whatsappConnections.noSessions')}
            description={t('whatsappConnections.noSessionsDescription')}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {activeConnections.map((conn, i) => (
            <div
              key={conn.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-xs font-semibold text-accent select-none shrink-0">
                {(conn.userEmail ?? conn.userId).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium truncate">
                  {conn.userEmail ?? conn.userId}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {isSuperAdmin && (
                    <>
                      <span className="text-xs text-text-dim font-mono">
                        {conn.orgId}
                      </span>
                      <span className="text-text-dim">&middot;</span>
                    </>
                  )}
                  <span className="text-xs text-text-dim">
                    {conn.phone ?? t('common.noPhone')}
                  </span>
                  <span className="text-text-dim">&middot;</span>
                  <span className="text-xs text-text-dim">
                    {new Date(conn.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {statusBadge(conn.status)}
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRevokeTarget(conn)}
                loading={revoking === conn.userId}
              >
                {t('whatsappConnections.revoke')}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        title={t('whatsappConnections.revokeSession')}
      >
        <div className="space-y-4">
          <p
            className="text-sm text-text-muted"
            dangerouslySetInnerHTML={{
              __html: t('whatsappConnections.revokeConfirm', {
                name: revokeTarget?.userEmail ?? revokeTarget?.userId,
              }),
            }}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setRevokeTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRevoke}
              loading={revoking !== null}
            >
              {t('whatsappConnections.revokeSessionButton')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
