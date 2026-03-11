import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useApp } from "../../context/AppContext";
import { useChannels } from "../../hooks/useChannels";
import { completeOnboarding } from "../../api/auth";
import QRCode from "qrcode";
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
import { MessageCircleIcon } from "../ui/Icons";
import type { WhatsAppStatus } from "../../types";

interface OnboardingPageProps {
  onComplete: () => void;
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}

// ── Badge helpers ────────────────────────────────────────────────────────────

function getStatusBadgeVariant(
  status: WhatsAppStatus["status"] | undefined,
): "success" | "warning" | "default" {
  if (status === "connected") return "success";
  if (status === "qr" || status === "code" || status === "pending")
    return "warning";
  return "default";
}

function getStatusBadgeLabel(
  status: WhatsAppStatus["status"] | undefined,
): string {
  switch (status) {
    case "connected":
      return i18n.t("onboarding.whatsappConnected");
    case "qr":
      return i18n.t("onboarding.awaitingScan");
    case "code":
      return i18n.t("onboarding.awaitingCode");
    case "pending":
      return i18n.t("onboarding.activating");
    default:
      return i18n.t("onboarding.notActivated");
  }
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ConnectedContent({ phone }: { phone: string | null }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
        <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
          <MessageCircleIcon size={20} className="text-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-bright">
            {t('onboarding.whatsappConnected')}
          </p>
          {phone && (
            <p className="text-xs text-text-muted font-mono">{phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PairingCodeContent({
  pairingCode,
}: {
  pairingCode: string | null;
}) {
  const { t } = useTranslation();
  if (!pairingCode) {
    return (
      <div className="flex flex-col items-center py-8 animate-fade-in">
        <Skeleton className="h-12 w-48 rounded-[var(--radius-md)]" />
        <p className="text-xs text-text-muted mt-4 animate-pulse">
          {t('onboarding.generatingCode')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <div className="px-6 py-4 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card-hover)]">
        <p className="text-3xl font-bold font-mono tracking-[0.3em] text-text-bright text-center">
          {pairingCode}
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-text-muted">
          {t('onboarding.enterCodeWhatsapp')}
        </p>
        <p className="text-xs text-text-dim mt-1">
          {t('onboarding.openWhatsappCode')}
        </p>
      </div>
    </div>
  );
}

function PhoneInputContent({
  onEnable,
  enabling,
}: {
  onEnable: (phone: string) => void;
  enabling: boolean;
}) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState("");
  const [foreignError, setForeignError] = useState(false);

  const isValid = digits.length === 9 && /^[67]/.test(digits);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Detect paste of a foreign international number
    if (raw.includes("+") && !raw.startsWith("+34")) {
      setForeignError(true);
      return;
    }
    setForeignError(false);

    // Strip everything except digits
    const stripped = raw.replace(/[^0-9]/g, "");
    // If user typed/pasted +34… or 34…, remove the country code prefix
    const cleaned = stripped.startsWith("34") ? stripped.slice(2) : stripped;
    // Cap at 9 digits
    setDigits(cleaned.slice(0, 9));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onEnable("34" + digits);
  };

  const getError = (): string | undefined => {
    if (foreignError) return t('onboarding.spanishOnly');
    if (digits.length > 0 && digits.length < 9)
      return t('onboarding.enterDigits');
    if (digits.length === 9 && !isValid)
      return t('onboarding.startWith67');
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <EmptyState
        icon={<MessageCircleIcon size={40} />}
        title={t('onboarding.whatsappNotActivated')}
        description={t('onboarding.enterPhoneNumber')}
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="phone-input"
          className="text-xs font-medium text-text-muted"
        >
          {t('onboarding.phoneNumber')}
        </label>
        <div className="flex items-stretch gap-0">
          <span className="flex items-center px-3 bg-surface border border-r-0 border-border text-text-muted text-sm rounded-l-[var(--radius-md)] select-none">
            +34
          </span>
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            placeholder="612 345 678"
            value={digits}
            onChange={handleChange}
            maxLength={9}
            required
            className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-r-[var(--radius-md)] rounded-l-none outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors placeholder:text-text-dim"
          />
        </div>
        {getError() && (
          <p className="text-xs text-red">{getError()}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="primary"
        loading={enabling}
        disabled={!isValid}
      >
        {t('onboarding.linkWhatsapp')}
      </Button>
    </form>
  );
}

function QrContent({ qrData }: { qrData: string | null }) {
  const { t } = useTranslation();
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    if (!qrData) {
      setQrImage(null);
      return;
    }
    QRCode.toDataURL(qrData, { width: 256, margin: 2 })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [qrData]);

  if (!qrData || !qrImage) {
    return (
      <div className="flex flex-col items-center py-8 animate-fade-in">
        <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
        <p className="text-xs text-text-muted mt-4 animate-pulse">
          {t('onboarding.generatingQR')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <div className="p-3 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-card-hover)]">
        <img src={qrImage} alt="WhatsApp QR Code" className="w-56 h-56" />
      </div>
      <div className="text-center">
        <p className="text-sm text-text-muted">{t('onboarding.scanWhatsapp')}</p>
        <p className="text-xs text-text-dim mt-1">
          {t('onboarding.openWhatsappQR')}
        </p>
      </div>
    </div>
  );
}

function PendingQrContent() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-8 animate-fade-in">
      <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
      <p className="text-xs text-text-muted mt-4 animate-pulse">
        {t('onboarding.waitingSession')}
      </p>
    </div>
  );
}

function DesktopNotEnabledContent({
  onEnable,
  enabling,
}: {
  onEnable: () => void;
  enabling: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fade-in">
      <EmptyState
        icon={<MessageCircleIcon size={40} />}
        title={t('onboarding.whatsappNotActivated')}
        description={t('onboarding.activateDescription')}
      />
      <Button variant="primary" onClick={onEnable} loading={enabling}>
        {t('onboarding.activateWhatsapp')}
      </Button>
    </div>
  );
}

function LoadingContent() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { t } = useTranslation();
  const { authState, addToast } = useApp();
  const { status, qrData, pairingCode, loading, enable } = useChannels();
  const [enabling, setEnabling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const mobile = isMobile();

  const user = authState.status === "authenticated" ? authState.user : null;
  const firstName = user?.firstName ?? user?.name ?? "";

  const handleEnable = async (linkingMethod?: "qr" | "code", phone?: string) => {
    setEnabling(true);
    try {
      await enable(linkingMethod, phone);
    } catch {
      addToast(t('onboarding.enableError'), "error");
    } finally {
      setEnabling(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeOnboarding();
      onComplete();
    } catch {
      addToast(t('onboarding.completeError'), "error");
    } finally {
      setCompleting(false);
    }
  };

  const isConnected = status?.status === "connected";

  function renderContent() {
    // Loading state (no status data yet)
    if (loading && !status) {
      return <LoadingContent />;
    }

    // Connected -- same for mobile and desktop
    if (isConnected) {
      return <ConnectedContent phone={status?.phone ?? null} />;
    }

    // Mobile flow: pairing code
    if (mobile) {
      if (status?.status === "code") {
        return <PairingCodeContent pairingCode={pairingCode} />;
      }
      if (status?.status === "pending" && status.linkingMethod === "code") {
        return <PairingCodeContent pairingCode={null} />;
      }
      return (
        <PhoneInputContent
          onEnable={(phone) => handleEnable("code", phone)}
          enabling={enabling}
        />
      );
    }

    // Desktop flow: QR code
    if (status?.status === "qr") {
      return <QrContent qrData={qrData} />;
    }
    if (status?.status === "pending") {
      return <PendingQrContent />;
    }
    return (
      <DesktopNotEnabledContent
        onEnable={() => handleEnable()}
        enabling={enabling}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg noise-bg relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[150px] pointer-events-none animate-[glow-pulse_5s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-brand/6 rounded-full blur-[120px] pointer-events-none animate-[glow-pulse_7s_ease-in-out_infinite_1s]" />

      <div className="w-full max-w-md animate-fade-in-up relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-xl)] flex items-center justify-center mb-5 shadow-[var(--shadow-glow-accent)] animate-[float_4s_ease-in-out_infinite]">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            {firstName ? t('onboarding.welcome', { name: firstName }) : t('onboarding.welcomeGeneric')}
          </h1>
          <p className="text-xs text-text-muted mt-2 text-center">
            {t('onboarding.configureWhatsapp')}
          </p>
        </div>

        <Card className="gradient-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[var(--radius-md)] bg-green-muted flex items-center justify-center">
                  <MessageCircleIcon size={14} className="text-green" />
                </div>
                <CardTitle>{t('onboarding.whatsapp')}</CardTitle>
              </div>
              {!loading || status ? (
                <Badge
                  variant={getStatusBadgeVariant(status?.status)}
                  dot
                  pulse={isConnected}
                >
                  {getStatusBadgeLabel(status?.status)}
                </Badge>
              ) : (
                <Skeleton className="h-5 w-24" />
              )}
            </div>
            <CardDescription>
              {t('onboarding.connectWhatsapp')}
            </CardDescription>
          </CardHeader>

          <CardContent>{renderContent()}</CardContent>
        </Card>

        <div className="flex justify-center gap-3 mt-6">
          {isConnected ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleComplete}
              loading={completing}
              className="px-8"
            >
              {t('onboarding.continue')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleComplete}
              loading={completing}
            >
              {t('onboarding.skipForNow')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
