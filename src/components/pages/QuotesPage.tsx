import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useQuotes } from "../../hooks/useQuotes";
import { downloadQuotePdf } from "../../api/quotes";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";
import { FileTextIcon, DownloadIcon } from "../ui/Icons";
import { formatDate } from "../../utils/format";

function triggerDownload(base64: string, filename: string) {
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function QuotesPage() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const { quotes, loading, error } = useQuotes();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      const { pdfBase64, filename } = await downloadQuotePdf(id);
      triggerDownload(pdfBase64, filename);
    } catch {
      addToast(t('quotes.downloadFailed'), "error");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('quotes.title')}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('quotes.subtitle')}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-md)] text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-[var(--radius-lg)] p-4 flex items-center gap-4"
            >
              <Skeleton className="w-8 h-8 rounded-[var(--radius-md)]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileTextIcon size={40} />}
            title={t('quotes.noQuotes')}
            description={t('quotes.noQuotesDescription')}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote, i) => (
            <div
              key={quote.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border border-l-2 border-l-accent/20 rounded-[var(--radius-lg)] glow-card accent-line animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-accent-dim flex items-center justify-center shrink-0">
                <FileTextIcon size={16} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium font-mono truncate">
                  {quote.quoteNumber}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {quote.clientName}
                  </span>
                  <span className="text-text-muted">&middot;</span>
                  <span className="text-xs text-text-muted">
                    {formatDate(quote.createdAt)}
                  </span>
                </div>
              </div>
              <span className="text-sm text-text-bright font-semibold font-mono tabular-nums whitespace-nowrap">
                {Number(quote.total).toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                &euro;
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={<DownloadIcon size={16} />}
                loading={downloadingId === quote.id}
                onClick={() => handleDownload(quote.id)}
                title="Download PDF"
              >
                PDF
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
