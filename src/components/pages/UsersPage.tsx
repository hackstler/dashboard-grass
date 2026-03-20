import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useUsers } from "../../hooks/useUsers";
import { useAuthAdapter } from "../../hooks/useAuthAdapter";
import { createInvitation, listInvitations, revokeInvitation } from "../../api/admin";
import type { AdminUser, Invitation } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { SearchIcon, TrashIcon, UsersIcon, PlusIcon, EditIcon } from "../ui/Icons";
import { formatDate } from "../../utils/format";

export function UsersPage() {
  const { t } = useTranslation();
  const { user, addToast } = useApp();
  const { can } = usePermissions();
  const { strategyName: strategy } = useAuthAdapter();
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  const {
    users,
    loading,
    error,
    createUser,
    editUser,
    deleteUser,
  } = useUsers({ orgId: orgFilter, search });

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user" | "super_admin">("user");

  // Edit modal
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user" | "super_admin">("user");
  const [editPassword, setEditPassword] = useState("");
  const [editOrgId, setEditOrgId] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Invitation state
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "user">("user");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchInvitations = useCallback(async () => {
    if (!can("view_org_users")) return;
    try {
      const data = await listInvitations();
      setInvitations(data.items.filter((i) => !i.usedAt));
    } catch {
      // silently fail
    }
  }, [can]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      if (strategy === "firebase") {
        await createUser({
          email: newEmail,
          orgId: newOrgId,
          role: newRole,
        });
      } else {
        await createUser({
          email: newEmail,
          password: newPassword,
          name: newName || undefined,
          surname: newSurname || undefined,
          orgId: newOrgId,
          role: newRole,
        });
      }
      addToast(strategy === "firebase" ? t('users.userInvited') : t('users.userCreated'), "success");
      setShowCreate(false);
      resetCreateForm();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('users.createFailed'),
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
      await deleteUser(deleteTarget.id);
      addToast(t('users.userDeleted'), "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('users.deleteFailed'),
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      const data: { email?: string; name?: string; surname?: string; role?: string; password?: string; orgId?: string } = {};
      if (editName !== (editTarget.name ?? "")) data.name = editName;
      if (editSurname !== (editTarget.surname ?? "")) data.surname = editSurname;
      if (editEmail !== editTarget.email) data.email = editEmail;
      if (editRole !== editTarget.role) data.role = editRole;
      if (editPassword) data.password = editPassword;
      if (editOrgId !== editTarget.orgId) data.orgId = editOrgId;
      await editUser(editTarget.id, data);
      addToast(t('users.userUpdated'), "success");
      setEditTarget(null);
      resetEditForm();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('users.updateFailed'),
        "error"
      );
    } finally {
      setEditing(false);
    }
  };

  const openEditModal = (u: AdminUser) => {
    setEditTarget(u);
    setEditName(u.name ?? "");
    setEditSurname(u.surname ?? "");
    setEditEmail(u.email);
    setEditRole(u.role as "admin" | "user" | "super_admin");
    setEditPassword("");
    setEditOrgId(u.orgId);
  };

  const resetEditForm = () => {
    setEditName("");
    setEditSurname("");
    setEditEmail("");
    setEditRole("user");
    setEditPassword("");
    setEditOrgId("");
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      const result = await createInvitation({
        email: inviteEmail || undefined,
        role: inviteRole,
      });
      setInviteUrl(result.inviteUrl);
      addToast(t('users.invitationCreated'), "success");
      fetchInvitations();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('users.invitationCreateFailed'),
        "error",
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await revokeInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      addToast(t('users.invitationRevoked'), "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('users.invitationRevokeFailed'),
        "error",
      );
    }
  };

  const handleCopyInviteUrl = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCreateForm = () => {
    setNewName("");
    setNewSurname("");
    setNewEmail("");
    setNewPassword("");
    setNewOrgId("");
    setNewRole("user");
  };

  const isCreateDisabled =
    strategy === "firebase"
      ? !newEmail || !newOrgId
      : !newEmail || !newPassword || !newOrgId;

  const isSelf = (u: AdminUser) => u.id === user?.id;

  const displayName = (u: AdminUser) =>
    u.name && u.surname ? `${u.name} ${u.surname}` : u.name ?? u.email;

  const avatarInitial = (u: AdminUser) =>
    (u.name ?? u.email ?? "?").charAt(0).toUpperCase();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('users.title')}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('users.subtitle')}
          </p>
        </div>
        {can("create_org_users") && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={() => {
                setShowInvite(true);
                setInviteUrl(null);
                setInviteEmail("");
                setInviteRole("user");
                setCopied(false);
              }}
            >
              {t('users.inviteViaLink')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={() => setShowCreate(true)}
            >
              {strategy === "firebase" ? t('users.inviteUser') : t('users.createUser')}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up stagger-1">
        <Input
          placeholder={t('users.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<SearchIcon size={16} />}
          className="w-full sm:w-64"
        />
        <Input
          placeholder={t('users.filterByOrg')}
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="w-full sm:w-48"
        />
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
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UsersIcon size={40} />}
            title={t('users.noUsers')}
            description={
              search || orgFilter
                ? t('users.adjustFilters')
                : strategy === "firebase"
                  ? t('users.inviteFirst')
                  : t('users.createFirst')
            }
            action={
              !search && !orgFilter ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<PlusIcon size={16} />}
                  onClick={() => setShowCreate(true)}
                >
                  {t('users.createUser')}
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => (
            <div
              key={u.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)] glow-card accent-line animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-xs font-semibold text-accent select-none shrink-0">
                {avatarInitial(u)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-bright font-medium truncate">
                  {displayName(u)}
                  {isSelf(u) && (
                    <span className="text-xs text-text-dim ml-2">{t('common.you')}</span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted font-mono">
                    {u.email}
                  </span>
                  <span className="text-text-muted/50">&middot;</span>
                  <span className="text-xs text-text-muted/70 font-mono">
                    {u.orgId}
                  </span>
                  <span className="text-text-muted/50">&middot;</span>
                  <span className="text-xs text-text-muted font-mono">
                    {formatDate(u.createdAt)}
                  </span>
                </div>
              </div>
              <Badge variant={u.role === "admin" ? "info" : u.role === "super_admin" ? "info" : "default"}>
                {u.role}
              </Badge>
              {can("edit_org_users") && (
                <button
                  onClick={() => openEditModal(u)}
                  className="btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] text-text-dim hover:text-accent hover:bg-accent/10"
                  title={t('common.edit')}
                >
                  <EditIcon size={16} />
                </button>
              )}
              {can("delete_org_users") && (
                <button
                  onClick={() => {
                    if (isSelf(u)) {
                      addToast(t('users.cannotDeleteSelf'), "error");
                      return;
                    }
                    setDeleteTarget(u);
                  }}
                  className={`btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] ${
                    isSelf(u)
                      ? "text-text-dim/30 cursor-not-allowed"
                      : "text-text-dim hover:text-red hover:bg-red-muted"
                  }`}
                  title={isSelf(u) ? t('users.cannotDeleteSelf') : t('common.delete')}
                  disabled={isSelf(u)}
                >
                  <TrashIcon size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetCreateForm();
        }}
        title={strategy === "firebase" ? t('users.inviteUser') : t('users.createUser')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('common.name')}
              placeholder={t('users.firstNamePlaceholder')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label={t('profile.surname')}
              placeholder={t('users.lastNamePlaceholder')}
              value={newSurname}
              onChange={(e) => setNewSurname(e.target.value)}
            />
          </div>
          <Input
            label={t('common.email')}
            type="email"
            placeholder={t('users.emailPlaceholder')}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {strategy !== "firebase" && (
            <Input
              label={t('common.password')}
              type="password"
              placeholder={t('users.passwordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          )}
          <Input
            label={t('users.orgIdLabel')}
            placeholder={t('users.orgIdPlaceholder')}
            value={newOrgId}
            onChange={(e) => setNewOrgId(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">{t('common.role')}</label>
            <select
              value={newRole}
              onChange={(e) =>
                setNewRole(e.target.value as "admin" | "user" | "super_admin")
              }
              className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="user">{t('users.roleUser')}</option>
              <option value="admin">{t('users.roleAdmin')}</option>
              <option value="super_admin">{t('users.roleSuperAdmin')}</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowCreate(false);
                resetCreateForm();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreate}
              loading={creating}
              disabled={isCreateDisabled}
            >
              {strategy === "firebase" ? t('users.invite') : t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editTarget !== null}
        onClose={() => {
          setEditTarget(null);
          resetEditForm();
        }}
        title={t('users.editUser')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('common.name')}
              placeholder={t('users.firstNamePlaceholder')}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              label={t('profile.surname')}
              placeholder={t('users.lastNamePlaceholder')}
              value={editSurname}
              onChange={(e) => setEditSurname(e.target.value)}
            />
          </div>
          <Input
            label={t('common.email')}
            type="email"
            placeholder={t('users.emailPlaceholder')}
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">{t('common.role')}</label>
            <select
              value={editRole}
              onChange={(e) =>
                setEditRole(e.target.value as "admin" | "user" | "super_admin")
              }
              className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
            >
              <option value="user">{t('users.roleUser')}</option>
              <option value="admin">{t('users.roleAdmin')}</option>
              <option value="super_admin">{t('users.roleSuperAdmin')}</option>
            </select>
          </div>
          {user?.role === "super_admin" && (
            <Input
              label={t('users.orgIdLabel')}
              placeholder={t('users.orgIdPlaceholder')}
              value={editOrgId}
              onChange={(e) => setEditOrgId(e.target.value)}
            />
          )}
          {strategy !== "firebase" && (
            <Input
              label={t('users.passwordKeepBlank')}
              type="password"
              placeholder={t('users.newPasswordPlaceholder')}
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditTarget(null);
                resetEditForm();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEdit}
              loading={editing}
              disabled={!editEmail}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mt-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-text-bright mb-4">
            {t('users.pendingInvitations')}
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 bg-surface border border-border rounded-[var(--radius-lg)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-bright font-medium truncate">
                    {inv.email ?? t('users.noEmail')}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted font-mono">
                      {t('users.expires', { date: formatDate(inv.expiresAt) })}
                    </span>
                  </div>
                </div>
                <Badge variant="default">{inv.role}</Badge>
                <button
                  onClick={() => handleRevokeInvitation(inv.id)}
                  className="btn-press transition-all cursor-pointer p-1.5 rounded-[var(--radius-sm)] text-text-dim hover:text-red hover:bg-red-muted"
                  title={t('users.revoke')}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t('users.deleteUser')}
      >
        <div className="space-y-4">
          <p
            className="text-sm text-text-muted"
            dangerouslySetInnerHTML={{
              __html: t('users.deleteUserConfirm', { name: deleteTarget ? displayName(deleteTarget) : "" }),
            }}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite via Link Modal */}
      <Modal
        open={showInvite}
        onClose={() => {
          setShowInvite(false);
          setInviteUrl(null);
        }}
        title={t('users.inviteViaLinkTitle')}
      >
        <div className="space-y-4">
          {inviteUrl ? (
            <>
              <p className="text-sm text-text-muted">
                {t('users.shareLink')}
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 bg-surface border border-border text-text text-xs px-3 py-2 rounded-[var(--radius-md)] font-mono truncate"
                />
                <Button
                  variant={copied ? "primary" : "secondary"}
                  size="sm"
                  onClick={handleCopyInviteUrl}
                >
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowInvite(false);
                    setInviteUrl(null);
                  }}
                >
                  {t('common.close')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Input
                label={t('users.emailOptional')}
                type="email"
                placeholder={t('users.emailOptionalPlaceholder')}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted">{t('common.role')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "user")}
                  className="w-full bg-surface border border-border text-text text-sm px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-accent/50 cursor-pointer"
                >
                  <option value="user">{t('users.roleUser')}</option>
                  <option value="admin">{t('users.roleAdmin')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowInvite(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleInvite}
                  loading={inviting}
                >
                  {t('users.createInvitation')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
