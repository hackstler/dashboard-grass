import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getMyOrganization,
  getOrganization,
  updateOrganization,
} from "../../api/admin";
import type { OrganizationDetail } from "../../types";
import { OrgEditPage } from "./OrgEditPage";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { Badge } from "../ui/Badge";
import { BuildingIcon } from "../ui/Icons";

export function MyOrganizationPage() {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const { can } = usePermissions();
  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrg = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyOrganization();
      setOrg(data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('myOrg.loadFailed'),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadOrg();
  }, [loadOrg]);

  // Admin with edit_own_org → full edit page (reuse OrgEditPage)
  if (can("edit_own_org") && org) {
    return (
      <OrgEditPage
        orgId={org.orgId}
        isOwnOrg={true}
        onBack={loadOrg}
        getOrganization={getOrganization}
        updateOrganization={updateOrganization}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No org found
  if (!org) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('myOrg.title')}
          </h1>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BuildingIcon size={40} className="text-text-dim mb-3" />
            <p className="text-sm text-text-muted">
              {t('myOrg.noOrgInfo')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Regular user → read-only view
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('myOrg.title')}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('myOrg.subtitle')}
          </p>
        </div>
        <Badge variant="info">{org.orgId}</Badge>
      </div>

      <div className="space-y-6">
        {/* Logo */}
        {org.logo && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-text-bright mb-4">
              {t('orgEdit.logo')}
            </h2>
            <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-surface-hi border border-border flex items-center justify-center overflow-hidden">
              <img
                src={org.logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Company Details */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            {t('orgEdit.companyDetails')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label={t('organizations.companyName')} value={org.name} />
            <InfoField label={t('organizations.slug')} value={org.slug} mono />
            <InfoField label={t('organizations.nif')} value={org.nif} />
            <InfoField label={t('common.email')} value={org.email} />
            <InfoField label={t('organizations.phone')} value={org.phone} />
            <div className="sm:col-span-2">
              <InfoField label={t('organizations.address')} value={org.address} />
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-2">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            {t('orgEdit.billing')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField
              label={t('organizations.vatRate')}
              value={org.vatRate != null ? `${org.vatRate * 100}%` : null}
            />
            <InfoField label={t('organizations.currency')} value={org.currency} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-xs font-medium text-text-dim mb-1">{label}</p>
      <p
        className={`text-sm text-text-bright ${mono ? "font-mono" : ""} ${!value ? "text-text-dim italic" : ""}`}
      >
        {value || t('common.notSet')}
      </p>
    </div>
  );
}
