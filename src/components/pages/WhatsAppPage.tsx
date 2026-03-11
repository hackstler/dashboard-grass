import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useApp } from "../../context/AppContext";
import { useChannels } from "../../hooks/useChannels";
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

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}

type BadgeVariant = "success" | "warning" | "default";

function getBadgeProps(statusValue: string | undefined): {
  variant: BadgeVariant;
  pulse: boolean;
  label: string;
} {
  switch (statusValue) {
    case "connected":
      return { variant: "success", pulse: true, label: i18n.t("common.connected") };
    case "qr":
      return { variant: "warning", pulse: false, label: i18n.t("whatsapp.awaitingScan") };
    case "code":
      return { variant: "warning", pulse: false, label: i18n.t("whatsapp.awaitingCode") };
    case "pending":
      return { variant: "warning", pulse: false, label: i18n.t("whatsapp.enabling") };
    case "not_enabled":
      return { variant: "default", pulse: false, label: i18n.t("whatsapp.notEnabled") };
    default:
      return { variant: "default", pulse: false, label: i18n.t("common.disconnected") };
  }
}

export function WhatsAppPage() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const { status, qrData, pairingCode, loading, enable, disconnect } =
    useChannels();
  const [disconnecting, setDisconnecting] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const mobile = isMobile();

  const handleEnable = async (
    linkingMethod?: "qr" | "code",
    phoneNumber?: string,
  ) => {
    setEnabling(true);
    try {
      await enable(linkingMethod, phoneNumber);
      addToast(t('whatsapp.sessionCreated'), "success");
    } catch {
      addToast(t('whatsapp.enableFailed'), "error");
    } finally {
      setEnabling(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnect();
      addToast(t('whatsapp.disconnected'), "success");
    } catch {
      addToast(t('whatsapp.disconnectFailed'), "error");
    } finally {
      setDisconnecting(false);
    }
  };

  function renderContent() {
    if (loading && !status) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-32 mt-2" />
        </div>
      );
    }

    if (status?.status === "connected") {
      return (
        <ConnectedContent
          phone={status.phone}
          onDisconnect={handleDisconnect}
          disconnecting={disconnecting}
        />
      );
    }

    if (mobile) {
      if (status?.status === "code") {
        return <PairingCodeContent pairingCode={pairingCode} />;
      }
      if (status?.status === "pending" && status.linkingMethod === "code") {
        return <MobilePendingCodeContent />;
      }
      return (
        <MobileNotEnabledContent onEnable={handleEnable} enabling={enabling} />
      );
    }

    if (status?.status === "qr") {
      return <QrContent qrData={qrData} />;
    }

    if (status?.status === "pending") {
      return <PendingContent />;
    }

    return <NotEnabledContent onEnable={handleEnable} enabling={enabling} />;
  }

  const badge = getBadgeProps(status?.status);

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          {t('whatsapp.title')}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t('whatsapp.subtitle')}
        </p>
      </div>

      <Card className="max-w-lg gradient-border animate-fade-in-up stagger-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[var(--radius-md)] bg-green-muted flex items-center justify-center">
                <MessageCircleIcon size={14} className="text-green" />
              </div>
              <CardTitle>{t('whatsapp.channelStatus')}</CardTitle>
            </div>
            {loading && !status ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <Badge variant={badge.variant} dot pulse={badge.pulse}>
                {badge.label}
              </Badge>
            )}
          </div>
          <CardDescription>
            {t('whatsapp.connectDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}

function ConnectedContent({
  phone,
  onDisconnect,
  disconnecting,
}: {
  phone: string | null;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4 p-3 bg-green-muted rounded-[var(--radius-md)] border border-green/10">
        <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center shadow-[var(--shadow-glow-green)]">
          <MessageCircleIcon size={20} className="text-green" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-bright">
            {t('whatsapp.whatsappConnected')}
          </p>
          {phone && (
            <p className="text-xs text-text-muted font-mono">{phone}</p>
          )}
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        onClick={onDisconnect}
        loading={disconnecting}
      >
        {t('common.disconnect')}
      </Button>
    </div>
  );
}

function QrContent({ qrData }: { qrData: string | null }) {
  const { t } = useTranslation();
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    if (!qrData) return;
    QRCode.toDataURL(qrData, { width: 256, margin: 2 })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [qrData]);

  if (!qrData || !qrImage) {
    return (
      <div className="flex flex-col items-center py-8">
        <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
        <p className="text-xs text-text-muted mt-4 animate-pulse">
          {t('whatsapp.generatingQR')}
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
        <p className="text-sm text-text-muted">{t('whatsapp.scanWhatsapp')}</p>
        <p className="text-xs text-text-dim mt-1">
          {t('whatsapp.openWhatsappQR')}
        </p>
      </div>
    </div>
  );
}

const SPANISH_MOBILE_RE = /^[67]\d{8}$/;

function MobileNotEnabledContent({
  onEnable,
  enabling,
}: {
  onEnable: (linkingMethod: "code", phoneNumber: string) => void;
  enabling: boolean;
}) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState("");
  const [foreignError, setForeignError] = useState(false);

  const isValid = SPANISH_MOBILE_RE.test(digits);
  const showLengthHint = digits.length > 0 && digits.length < 9 && !foreignError;
  const showPatternHint =
    digits.length === 9 && !isValid && !foreignError;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    // Detect paste / typing of a foreign international prefix
    if (raw.startsWith("+") && !raw.startsWith("+34")) {
      setForeignError(true);
      setDigits("");
      return;
    }

    setForeignError(false);

    // Strip +34 prefix if user pasted it, then keep only digits
    const stripped = raw.startsWith("+34") ? raw.slice(3) : raw;
    const onlyDigits = stripped.replace(/[^0-9]/g, "");

    // Cap at 9 digits
    setDigits(onlyDigits.slice(0, 9));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onEnable("code", "34" + digits);
  }

  const errorMessage = foreignError
    ? t('whatsapp.spanishOnly')
    : showPatternHint
      ? t('whatsapp.startWith67')
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <EmptyState
        icon={<MessageCircleIcon size={40} />}
        title={t('whatsapp.whatsappNotActivated')}
        description={t('whatsapp.enterPhoneNumber')}
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="phone-input"
          className="text-xs font-medium text-text-muted"
        >
          {t('whatsapp.phoneNumber')}
        </label>
        <div className="flex items-stretch">
          <span className="inline-flex items-center px-3 bg-surface border border-r-0 border-border rounded-l-[var(--radius-md)] text-sm text-text-muted select-none">
            +34
          </span>
          <input
            id="phone-input"
            type="tel"
            inputMode="numeric"
            placeholder="612 345 678"
            value={digits}
            onChange={handleChange}
            required
            className={`w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-r-[var(--radius-md)] rounded-l-none outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors placeholder:text-text-dim ${
              errorMessage ? "border-red/50" : ""
            }`}
          />
        </div>
        {errorMessage && (
          <p className="text-xs text-red">{errorMessage}</p>
        )}
        {showLengthHint && (
          <p className="text-xs text-text-dim">
            {t('whatsapp.digitsCount', { count: digits.length })}
          </p>
        )}
      </div>
      <Button
        type="submit"
        variant="primary"
        loading={enabling}
        disabled={!isValid}
      >
        {t('whatsapp.linkWhatsapp')}
      </Button>
    </form>
  );
}

function MobilePendingCodeContent() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-8 animate-fade-in">
      <Skeleton className="h-12 w-48 rounded-[var(--radius-md)]" />
      <p className="text-xs text-text-muted mt-4 animate-pulse">
        {t('whatsapp.generatingCode')}
      </p>
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
          {t('whatsapp.generatingCode')}
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
          {t('whatsapp.enterCodeWhatsapp')}
        </p>
        <p className="text-xs text-text-dim mt-1">
          {t('whatsapp.openWhatsappCode')}
        </p>
      </div>
    </div>
  );
}

function NotEnabledContent({
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
        title={t('whatsapp.notEnabled')}
        description={t('whatsapp.enableDescription')}
      />
      <Button variant="primary" onClick={() => onEnable()} loading={enabling}>
        {t('whatsapp.enableWhatsapp')}
      </Button>
    </div>
  );
}

function PendingContent() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center py-8 animate-fade-in">
      <Skeleton className="w-56 h-56 rounded-[var(--radius-lg)]" />
      <p className="text-xs text-text-muted mt-4 animate-pulse">
        {t('whatsapp.waitingSession')}
      </p>
    </div>
  );
}
