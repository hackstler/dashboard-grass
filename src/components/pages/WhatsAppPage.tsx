import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { getMyOrganization } from "../../api/admin";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/Card";
import { MessageCircleIcon, CheckCircleIcon } from "../ui/Icons";

const AGENT_PHONE = "34628506129";

export function WhatsAppPage() {
  const { t } = useTranslation();
  const { user } = useApp();
  const [agentName, setAgentName] = useState<string | null>(null);

  useEffect(() => {
    getMyOrganization().then((org) => {
      setAgentName(org?.name ?? null);
    }).catch(() => {});
  }, []);

  const waLink = `https://wa.me/${AGENT_PHONE}?text=${encodeURIComponent(t("whatsapp.defaultMessage"))}`;
  const displayPhone = "+34 628 50 61 29";

  const steps = [
    { key: "step1", icon: "1" },
    { key: "step2", icon: "2" },
    { key: "step3", icon: "3" },
  ];

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
          {t("whatsapp.title")}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t("whatsapp.heroSubtitle")}
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Main CTA card */}
        <Card className="gradient-border animate-fade-in-up stagger-1 overflow-hidden">
          <div className="relative">
            {/* Green accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25D366] to-[#128C7E]" />

            <CardHeader className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.15)]">
                  <MessageCircleIcon size={24} className="text-[#25D366]" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t("whatsapp.ctaTitle")}</CardTitle>
                  <CardDescription>{t("whatsapp.ctaDescription")}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                {/* Phone number display */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-hi/50 border border-border">
                  <span className="text-lg font-mono font-semibold text-text-bright tracking-wide">{displayPhone}</span>
                </div>

                {/* CTA Button */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da851] text-white text-base font-semibold rounded-xl transition-all shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)]"
                >
                  <MessageCircleIcon size={20} />
                  {t("whatsapp.openWhatsApp")}
                </a>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* How it works */}
        <Card className="gradient-border animate-fade-in-up stagger-2">
          <CardHeader>
            <CardTitle className="text-base">{t("whatsapp.howItWorksTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-bright">{t(`whatsapp.${step.key}Title`)}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t(`whatsapp.${step.key}Desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="gradient-border animate-fade-in-up stagger-3">
          <CardHeader>
            <CardTitle className="text-base">{t("whatsapp.featuresTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["quotes", "email", "catalog", "calendar"].map((feat) => (
                <div key={feat} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-hi/30">
                  <CheckCircleIcon size={14} className="text-green shrink-0" />
                  <span className="text-xs text-text-muted">{t(`whatsapp.feat_${feat}`)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
