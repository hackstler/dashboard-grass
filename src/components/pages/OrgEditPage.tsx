import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import type { OrganizationDetail } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Skeleton } from "../ui/Skeleton";
import { ArrowLeftIcon, SaveIcon, ImageIcon } from "../ui/Icons";

interface OrgEditPageProps {
  orgId: string;
  isOwnOrg: boolean;
  onBack: () => void;
  getOrganization: (orgId: string) => Promise<OrganizationDetail>;
  updateOrganization: (
    orgId: string,
    data: Record<string, unknown>
  ) => Promise<OrganizationDetail>;
}

export function OrgEditPage({
  orgId,
  isOwnOrg,
  onBack,
  getOrganization,
  updateOrganization,
}: OrgEditPageProps) {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ref for onBack to avoid including it in useCallback deps (prevents re-fetch loops)
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [vatRate, setVatRate] = useState("");
  const [currency, setCurrency] = useState("\u20ac");
  const [logo, setLogo] = useState<string | null>(null);

  // Quote settings
  const [paymentTerms, setPaymentTerms] = useState("");
  const [quoteValidityDays, setQuoteValidityDays] = useState("");
  const [companyRegistration, setCompanyRegistration] = useState("");

  const loadOrg = useCallback(async () => {
    setLoading(true);
    try {
      const org = await getOrganization(orgId);
      setName(org.name ?? "");
      setSlug(org.slug ?? "");
      setAddress(org.address ?? "");
      setPhone(org.phone ?? "");
      setEmail(org.email ?? "");
      setNif(org.nif ?? "");
      setVatRate(org.vatRate != null ? String(org.vatRate * 100) : "");
      setCurrency(org.currency ?? "\u20ac");
      setLogo(org.logo);
      const qs = org.quoteSettings;
      setPaymentTerms(qs?.paymentTerms ?? "");
      setQuoteValidityDays(qs?.quoteValidityDays != null ? String(qs.quoteValidityDays) : "");
      setCompanyRegistration(qs?.companyRegistration ?? "");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('myOrg.loadFailed'),
        "error"
      );
      onBackRef.current();
    } finally {
      setLoading(false);
    }
  }, [orgId, getOrganization, addToast]);

  useEffect(() => {
    loadOrg();
  }, [loadOrg]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const vatNum = vatRate ? parseFloat(vatRate) / 100 : null;
      const qs: Record<string, unknown> = {};
      if (paymentTerms) qs.paymentTerms = paymentTerms;
      if (quoteValidityDays) qs.quoteValidityDays = parseInt(quoteValidityDays, 10);
      if (companyRegistration) qs.companyRegistration = companyRegistration;

      await updateOrganization(orgId, {
        name: name || null,
        slug: slug || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        nif: nif || null,
        vatRate: vatNum,
        currency: currency || "\u20ac",
        logo,
        quoteSettings: Object.keys(qs).length > 0 ? qs : null,
      });
      addToast(t('orgEdit.orgUpdated'), "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('orgEdit.updateFailed'),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      addToast(t('orgEdit.logoTooLarge'), "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-8 h-8 rounded-[var(--radius-md)]" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-press p-2 rounded-[var(--radius-md)] text-text-muted hover:text-text hover:bg-surface-hover transition-all cursor-pointer"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
              {name || orgId}
            </h1>
            <p className="text-sm text-text-muted mt-1 font-mono">{orgId}</p>
          </div>
        </div>
        {isOwnOrg && (
          <Button
            variant="primary"
            size="sm"
            icon={<SaveIcon size={16} />}
            onClick={handleSave}
            loading={saving}
          >
            {t('common.saveChanges')}
          </Button>
        )}
      </div>

      {!isOwnOrg && (
        <div className="mb-6 px-4 py-3 bg-yellow/10 border border-yellow/20 rounded-[var(--radius-md)] text-sm text-yellow">
          {t('orgEdit.onlyEditOwn')}
        </div>
      )}

      <div className="space-y-6">
        {/* Logo Section */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-text-bright mb-4">{t('orgEdit.logo')}</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-surface-hi border border-border flex items-center justify-center overflow-hidden shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImageIcon size={28} className="text-text-dim" />
              )}
            </div>
            <div className="space-y-2">
              <label
                className={`btn-press inline-flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border transition-all ${
                  isOwnOrg
                    ? "bg-surface-hi hover:bg-surface-hover text-text cursor-pointer"
                    : "text-text-dim cursor-not-allowed opacity-50"
                }`}
              >
                <ImageIcon size={14} />
                {t('orgEdit.uploadLogo')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={!isOwnOrg}
                />
              </label>
              {logo && isOwnOrg && (
                <button
                  onClick={() => setLogo(null)}
                  className="block text-xs text-text-dim hover:text-red transition-colors cursor-pointer"
                >
                  {t('orgEdit.removeLogo')}
                </button>
              )}
              <p className="text-xs text-text-dim">{t('orgEdit.logoSizeLimit')}</p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            {t('orgEdit.companyDetails')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('organizations.companyName')}
              placeholder={t('organizations.companyNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label={t('organizations.slug')}
              placeholder={t('organizations.slugPlaceholder')}
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              disabled={!isOwnOrg}
            />
            <Input
              label={t('organizations.nif')}
              placeholder={t('organizations.nifPlaceholder')}
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label={t('common.email')}
              type="email"
              placeholder={t('organizations.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label={t('organizations.phone')}
              type="tel"
              placeholder={t('organizations.phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isOwnOrg}
            />
            <div className="sm:col-span-2">
              <Textarea
                label={t('organizations.address')}
                placeholder={t('organizations.addressPlaceholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isOwnOrg}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-2">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            {t('orgEdit.billing')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('organizations.vatRate')}
              type="number"
              placeholder={t('organizations.vatRatePlaceholder')}
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              disabled={!isOwnOrg}
            />
            <Input
              label={t('organizations.currency')}
              placeholder={t('organizations.currencyPlaceholder')}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={!isOwnOrg}
            />
          </div>
        </div>

        {/* Quote Settings */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-3">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            {t('orgEdit.quoteSettings')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('orgEdit.quoteValidity')}
              type="number"
              placeholder="60"
              value={quoteValidityDays}
              onChange={(e) => setQuoteValidityDays(e.target.value)}
              disabled={!isOwnOrg}
            />
            <div />
            <div className="sm:col-span-2">
              <Textarea
                label={t('orgEdit.paymentTerms')}
                placeholder={t('orgEdit.paymentTermsPlaceholder')}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                disabled={!isOwnOrg}
                className="min-h-[80px]"
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label={t('orgEdit.companyRegistration')}
                placeholder={t('orgEdit.companyRegistrationPlaceholder')}
                value={companyRegistration}
                onChange={(e) => setCompanyRegistration(e.target.value)}
                disabled={!isOwnOrg}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Save button at bottom for mobile */}
        {isOwnOrg && (
          <div className="flex justify-end pt-2 pb-4">
            <Button
              variant="primary"
              size="sm"
              icon={<SaveIcon size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
