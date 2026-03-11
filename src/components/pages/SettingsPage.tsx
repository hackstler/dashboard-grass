import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useGoogleConnection } from "../../hooks/useGoogleConnection";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { SettingsIcon } from "../ui/Icons";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { addToast } = useApp();
  const { status, loading, connect, disconnect, refetch } = useGoogleConnection();
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Handle OAuth callback URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleConnected") === "true") {
      addToast(t('settings.googleConnectedSuccess'), "success");
      refetch();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("googleError")) {
      addToast(t('settings.googleConnectionFailed', { error: params.get("googleError") }), "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      addToast(t('settings.connectFailed'), "error");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnect();
      addToast(t('settings.googleDisconnected'), "success");
    } catch {
      addToast(t('settings.disconnectFailed'), "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card className="max-w-lg gradient-border animate-fade-in-up stagger-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-accent-dim flex items-center justify-center">
                <GoogleIcon size={14} />
              </div>
              <CardTitle>{t('settings.googleAccount')}</CardTitle>
            </div>
            {loading && !status ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge
                variant={status?.connected ? "success" : "default"}
                dot
                pulse={status?.connected}
              >
                {status?.connected ? t('common.connected') : t('settings.notConnected')}
              </Badge>
            )}
          </div>
          <CardDescription>
            {t('settings.connectDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading && !status ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32 mt-2" />
            </div>
          ) : status?.connected ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
                <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
                  <GoogleIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-bright">
                    {t('settings.googleConnected')}
                  </p>
                  <p className="text-xs text-text-muted">
                    {t('settings.gmailCalendarEnabled')}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDisconnect}
                loading={disconnecting}
              >
                {t('common.disconnect')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <EmptyState
                icon={<SettingsIcon size={40} />}
                title={t('settings.googleNotConnected')}
                description={t('settings.connectGoogleDescription')}
              />
              <Button
                variant="primary"
                onClick={handleConnect}
                loading={connecting}
              >
                {t('settings.connectGoogle')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-lg gradient-border animate-fade-in-up stagger-2">
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
          <CardDescription>{t('settings.languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {([["en", "English"], ["es", "Español"]] as const).map(([code, label]) => {
              const active = i18n.language.startsWith(code);
              return (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  className={`btn-press px-5 py-2 font-mono text-xs font-semibold tracking-wide rounded-[var(--radius-md)] transition-all duration-300 cursor-pointer ${
                    active
                      ? "bg-accent-dim text-accent shadow-[var(--shadow-nav-active)] border border-accent/20"
                      : "text-text-muted hover:text-text hover:bg-surface-hover border border-border"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}
