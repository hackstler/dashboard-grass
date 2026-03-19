import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { useAuthAdapter } from "../../hooks/useAuthAdapter";
import { updateProfile } from "../../api/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { SaveIcon } from "../ui/Icons";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, addToast, refreshUser } = useApp();
  const adapter = useAuthAdapter();
  const [name, setName] = useState(user?.name ?? "");
  const [surname, setSurname] = useState(user?.surname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const data: { email?: string; name?: string; surname?: string; password?: string } = {};

    if (name !== (user?.name ?? "")) {
      data.name = name;
    }
    if (surname !== (user?.surname ?? "")) {
      data.surname = surname;
    }
    if (email !== user?.email) {
      data.email = email;
    }
    if (password) {
      if (password !== confirmPassword) {
        addToast(t('profile.passwordsDontMatch'), "error");
        return;
      }
      if (password.length < 8) {
        addToast(t('profile.passwordMinLength'), "error");
        return;
      }
      data.password = password;
    }

    if (Object.keys(data).length === 0) {
      addToast(t('profile.noChanges'), "info");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(data);
      await refreshUser();
      addToast(t('profile.profileUpdated'), "success");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : t('profile.updateFailed'),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name && user?.surname
    ? `${user.name} ${user.surname}`
    : user?.name ?? user?.email;

  const avatarInitial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
            {t('profile.title')}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('profile.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Info (read-only) */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up">
          <h2 className="text-sm font-semibold text-text-bright mb-4">
            {t('profile.accountInfo')}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/40 to-brand/30 border border-accent/25 flex items-center justify-center text-base font-semibold text-accent select-none shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              {avatarInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-bright font-medium truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-muted font-mono">
                  {user?.email}
                </span>
                <span className="text-text-muted/50">&middot;</span>
                <span className="text-xs text-text-muted/70 font-mono">
                  {user?.orgId}
                </span>
                <Badge
                  variant={
                    user?.role === "super_admin" || user?.role === "admin"
                      ? "info"
                      : "default"
                  }
                >
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        {adapter.supportsPasswordManagement && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
            <h2 className="text-sm font-semibold text-text-bright mb-4">
              {t('profile.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <Input
                label={t('profile.firstName')}
                type="text"
                placeholder={t('profile.firstNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label={t('profile.surname')}
                type="text"
                placeholder={t('profile.surnamePlaceholder')}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Edit Email */}
        {adapter.supportsPasswordManagement && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-2">
            <h2 className="text-sm font-semibold text-text-bright mb-4">
              {t('profile.emailLabel')}
            </h2>
            <div className="max-w-md">
              <Input
                label={t('profile.emailAddress')}
                type="email"
                placeholder={t('profile.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Change Password */}
        {adapter.supportsPasswordManagement && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-3">
            <h2 className="text-sm font-semibold text-text-bright mb-4">
              {t('profile.changePassword')}
            </h2>
            <div className="space-y-4 max-w-md">
              <Input
                label={t('profile.newPassword')}
                type="password"
                placeholder={t('profile.newPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label={t('profile.confirmPassword')}
                type="password"
                placeholder={t('profile.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Save */}
        {adapter.supportsPasswordManagement && (
          <div className="flex justify-end pt-2 pb-4">
            <Button
              variant="primary"
              size="sm"
              icon={<SaveIcon size={16} />}
              onClick={handleSave}
              loading={saving}
            >
              {t('common.saveChanges')}
            </Button>
          </div>
        )}

        {!adapter.supportsPasswordManagement && (
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 animate-fade-in-up stagger-1">
            <p className="text-sm text-text-muted">
              {t('profile.firebaseManaged')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
