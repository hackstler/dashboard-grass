import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useOrganizations } from "../../hooks/useOrganizations";
import type { Organization } from "../../types";
import { OrgEditPage } from "./OrgEditPage";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import {
  BuildingIcon,
  TrashIcon,
  PlusIcon,
  UsersIcon,
  DatabaseIcon,
  AlertCircleIcon,
  EditIcon,
} from "../ui/Icons";
import { formatDate } from "../../utils/format";

// ── Create Form State ────────────────────────────────────────────────────────

interface CreateFormState {
  orgId: string;
  adminEmail: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  vatRate: string;
  currency: string;
}

const EMPTY_CREATE_FORM: CreateFormState = {
  orgId: "",
  adminEmail: "",
  name: "",
  slug: "",
  address: "",
  phone: "",
  email: "",
  nif: "",
  vatRate: "",
  currency: "",
};

// ── OrgCreateModal ───────────────────────────────────────────────────────────

interface OrgCreateModalProps {
  open: boolean;
  form: CreateFormState;
  creating: boolean;
  onFormChange: (updater: (prev: CreateFormState) => CreateFormState) => void;
  onCreate: () => void;
  onClose: () => void;
}

function OrgCreateModal({
  open,
  form,
  creating,
  onFormChange,
  onCreate,
  onClose,
}: OrgCreateModalProps) {
  const { t } = useTranslation();
  const set = (field: keyof CreateFormState, value: string) =>
    onFormChange((f) => ({ ...f, [field]: value }));

  return (
    <Modal open={open} onClose={onClose} title={t('organizations.createOrganization')}>
      <div className="space-y-4">
        <Input
          label={t('organizations.orgId')}
          placeholder={t('organizations.orgIdPlaceholder')}
          value={form.orgId}
          onChange={(e) => set("orgId", e.target.value)}
        />
        <Input
          label={t('organizations.adminEmail')}
          type="email"
          placeholder={t('organizations.adminEmailPlaceholder')}
          value={form.adminEmail}
          onChange={(e) => set("adminEmail", e.target.value)}
        />

        {/* Company details -- glass sub-surface */}
        <div className="bg-surface-hi/60 backdrop-blur-sm border border-border rounded-[var(--radius-lg)] p-4 space-y-3">
          <p className="text-xs font-medium text-text-dim tracking-wide uppercase">
            {t('organizations.companyDetails')}
          </p>
          <Input
            label={t('organizations.companyName')}
            placeholder={t('organizations.companyNamePlaceholder')}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            label={t('organizations.slug')}
            placeholder={t('organizations.slugPlaceholder')}
            value={form.slug}
            onChange={(e) =>
              set(
                "slug",
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
              )
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('organizations.nif')}
              placeholder={t('organizations.nifPlaceholder')}
              value={form.nif}
              onChange={(e) => set("nif", e.target.value)}
            />
            <Input
              label={t('common.email')}
              type="email"
              placeholder={t('organizations.emailPlaceholder')}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <Input
            label={t('organizations.phone')}
            type="tel"
            placeholder={t('organizations.phonePlaceholder')}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <Input
            label={t('organizations.address')}
            placeholder={t('organizations.addressPlaceholder')}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('organizations.vatRate')}
              type="number"
              placeholder={t('organizations.vatRatePlaceholder')}
              value={form.vatRate}
              onChange={(e) => set("vatRate", e.target.value)}
            />
            <Input
              label={t('organizations.currency')}
              placeholder={t('organizations.currencyPlaceholder')}
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreate}
            loading={creating}
            disabled={!form.orgId || !form.adminEmail}
          >
            {t('common.create')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── OrgDeleteModal ───────────────────────────────────────────────────────────

interface OrgDeleteModalProps {
  target: Organization | null;
  deleting: boolean;
  onDelete: () => void;
  onClose: () => void;
}

function OrgDeleteModal({
  target,
  deleting,
  onDelete,
  onClose,
}: OrgDeleteModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title={t('organizations.deleteOrganization')}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-muted/50 border border-red/20 rounded-[var(--radius-md)]">
          <AlertCircleIcon size={18} className="text-red shrink-0 mt-0.5" />
          <p className="text-sm text-red"
            dangerouslySetInnerHTML={{
              __html: t('organizations.deleteOrgWarning', { orgId: target?.orgId }),
            }}
          />
        </div>
        <p className="text-sm text-text-muted"
          dangerouslySetInnerHTML={{
            __html: t('organizations.deleteOrgConfirm', { orgId: target?.orgId }),
          }}
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            loading={deleting}
          >
            {t('organizations.deleteOrganization')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Organizations Page ──────────────────────────────────────────────────

export function OrganizationsPage() {
  const { t } = useTranslation();
  const { user, addToast } = useApp();
  const { can } = usePermissions();
  const {
    organizations: orgs,
    loading,
    error,
    createOrganization,
    deleteOrganization,
    getOrganization: getOrg,
    updateOrganization: updateOrg,
  } = useOrganizations();

  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isOwnOrg = (org: Organization) => org.orgId === user?.orgId;

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createOrganization({
        orgId: createForm.orgId,
        adminEmail: createForm.adminEmail,
        ...(createForm.name && { name: createForm.name }),
        ...(createForm.slug && { slug: createForm.slug }),
        ...(createForm.address && { address: createForm.address }),
        ...(createForm.phone && { phone: createForm.phone }),
        ...(createForm.email && { email: createForm.email }),
        ...(createForm.nif && { nif: createForm.nif }),
        ...(createForm.vatRate && {
          vatRate: parseFloat(createForm.vatRate) / 100,
        }),
        ...(createForm.currency && { currency: createForm.currency }),
      });
      addToast(t('organizations.orgCreated'), "success");
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE_FORM);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('organizations.createFailed'),
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOrganization(deleteTarget.orgId);
      addToast(t('organizations.orgDeleted'), "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('organizations.deleteFailed'),
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleBackFromEdit = useCallback(() => setEditingOrgId(null), []);

  // ── Edit view ────────────────────────────────────────────────────────────

  if (editingOrgId) {
    return (
      <OrgEditPage
        orgId={editingOrgId}
        isOwnOrg={can("edit_own_org")}
        onBack={handleBackFromEdit}
        getOrganization={getOrg}
        updateOrganization={updateOrg}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('organizations.title')}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('organizations.subtitle')}
          </p>
        </div>
        {can("create_org") && (
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={() => setShowCreate(true)}
          >
            {t('organizations.createOrganization')}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-md)] text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
      ) : orgs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BuildingIcon size={40} />}
            title={t('organizations.noOrganizations')}
            description={t('organizations.noOrgsDescription')}
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={16} />}
                onClick={() => setShowCreate(true)}
              >
                {t('organizations.createOrganization')}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {orgs.map((org, i) => (
            <div
              key={org.orgId}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-surface-hi flex items-center justify-center shrink-0">
                <BuildingIcon size={16} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setEditingOrgId(org.orgId)}
                  className="text-sm text-text-bright font-medium truncate hover:text-accent transition-colors cursor-pointer text-left"
                >
                  {org.name || org.orgId}
                  {isOwnOrg(org) && (
                    <span className="text-xs text-text-muted ml-2">{t('common.yours')}</span>
                  )}
                </button>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted font-mono">
                    {org.orgId}
                  </span>
                  {org.createdAt && (
                    <>
                      <span className="text-text-muted">&middot;</span>
                      <span className="text-xs font-mono text-text-muted">
                        {formatDate(org.createdAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <UsersIcon size={14} />
                  {org.userCount}
                </span>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <DatabaseIcon size={14} />
                  {org.docCount}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {can("edit_own_org") && (
                  <button
                    onClick={() => setEditingOrgId(org.orgId)}
                    className="btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] text-text-muted hover:text-accent hover:bg-accent/10"
                    title="Edit"
                  >
                    <EditIcon size={16} />
                  </button>
                )}
                {can("delete_org") && (
                  <button
                    onClick={() => {
                      if (isOwnOrg(org)) {
                        addToast(
                          t('organizations.cannotDeleteOwn'),
                          "error"
                        );
                        return;
                      }
                      setDeleteTarget(org);
                    }}
                    className={`btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] ${
                      isOwnOrg(org)
                        ? "text-text-muted/30 cursor-not-allowed"
                        : "text-text-muted hover:text-red hover:bg-red-muted"
                    }`}
                    title={
                      isOwnOrg(org)
                        ? t('organizations.cannotDeleteOwn')
                        : t('common.delete')
                    }
                    disabled={isOwnOrg(org)}
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <OrgCreateModal
        open={showCreate}
        form={createForm}
        creating={creating}
        onFormChange={setCreateForm}
        onCreate={handleCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateForm(EMPTY_CREATE_FORM);
        }}
      />

      <OrgDeleteModal
        target={deleteTarget}
        deleting={deleting}
        onDelete={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
