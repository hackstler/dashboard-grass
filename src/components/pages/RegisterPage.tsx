import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuthAdapter } from "../../hooks/useAuthAdapter";
import { isLoggedIn, validateInviteToken } from "../../api/auth";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import type { InviteValidation } from "../../types";

export function RegisterPage() {
  const { t } = useTranslation();
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const adapter = useAuthAdapter();
  const isFirebase = adapter.strategyName === "firebase";

  const [state, setState] = useState<"loading" | "invalid" | "form" | "done">("loading");
  const [validation, setValidation] = useState<InviteValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If user is already logged in (e.g. came back to invite link after registering), go to dashboard
  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Handle redirect result on mount (mobile comes back here after Google redirect)
  useEffect(() => {
    if (!isFirebase) return;
    let cancelled = false;
    adapter.handleRedirectResult().then((completed) => {
      if (completed && !cancelled) {
        setState("done");
        navigate("/", { replace: true });
      }
    }).catch((err) => {
      console.error("[RegisterPage] Redirect result failed:", err);
      if (!cancelled) setFormError(err instanceof Error ? err.message : t('register.registerError'));
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) {
      setErrorMessage(t('register.invalidLink'));
      setState("invalid");
      return;
    }

    validateInviteToken(token)
      .then((result) => {
        if (result.valid) {
          setValidation(result);
          if (result.email) setEmail(result.email);
          setState("form");
        } else {
          if (result.reason === "expired") {
            setErrorMessage(t('register.expiredInvitation'));
          } else if (result.reason === "used") {
            setErrorMessage(t('register.usedInvitation'));
          } else {
            setErrorMessage(t('register.invalidInvitation'));
          }
          setState("invalid");
        }
      })
      .catch(() => {
        setErrorMessage(t('register.invalidOrExpired'));
        setState("invalid");
      });
  }, [token]);

  const goToDashboard = () => {
    setState("done");
    navigate("/", { replace: true });
  };

  const handleCredentialRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError(t('register.passwordsDontMatch'));
      return;
    }
    if (password.length < 8) {
      setFormError(t('register.passwordMinLength'));
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await adapter.registerWithCredentials(
        token!,
        email,
        password,
        firstName || undefined,
        lastName || undefined,
        phone || undefined,
      );
      goToDashboard();
    } catch (err) {
      console.error("[RegisterPage] Credential registration failed:", err);
      setFormError(err instanceof Error ? err.message : t('register.registerError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setFormError(t('register.nameRequired'));
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await adapter.registerWithGoogle(
        token!,
        firstName.trim(),
        lastName.trim(),
        phone.trim() || undefined,
      );
      goToDashboard();
    } catch (err) {
      console.error("[RegisterPage] Google registration failed:", err);
      setFormError(err instanceof Error ? err.message : t('register.registerGoogleError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4 noise-bg relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[150px] pointer-events-none animate-[glow-pulse_5s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-brand/6 rounded-full blur-[120px] pointer-events-none animate-[glow-pulse_7s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-accent/4 rounded-full blur-[100px] pointer-events-none animate-[glow-pulse_6s_ease-in-out_infinite_2s]" />

      <div className="w-full max-w-sm animate-fade-in-up relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-brand rounded-[var(--radius-xl)] flex items-center justify-center mb-5 shadow-[var(--shadow-glow-accent)] animate-[float_4s_ease-in-out_infinite]">
            <span className="text-white text-2xl font-bold">A</span>
          </div>

          {(state === "loading" || state === "done") && (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </>
          )}

          {state === "invalid" && (
            <>
              <h1 className="text-2xl font-bold gradient-text">
                {t('register.invalidInvitationTitle')}
              </h1>
              <p className="text-xs text-text-muted mt-2 text-center">
                {errorMessage}
              </p>
            </>
          )}

          {state === "form" && (
            <>
              <h1 className="text-2xl font-bold gradient-text">
                {t('register.createAccount')}
              </h1>
              <p className="text-xs text-text-muted mt-2 text-center">
                {t('register.invitedToJoin')}{validation?.orgName ? ` ${validation.orgName}` : ""}
              </p>
            </>
          )}
        </div>

        {(state === "loading" || state === "done") && (
          <Card className="gradient-border">
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {state === "invalid" && (
          <Card className="gradient-border">
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-text-muted mb-4">{errorMessage}</p>
                <Button variant="primary" onClick={() => navigate("/", { replace: true })}>
                  {t('register.goToLogin')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {state === "form" && (
          <Card className="gradient-border">
            <CardContent>
              <div className="flex flex-col gap-4">
                {formError && (
                  <div className="px-3 py-2 bg-red-muted border border-red/20 rounded-[var(--radius-md)] animate-fade-in">
                    <p className="text-xs text-red">{formError}</p>
                  </div>
                )}

                {validation?.orgName && (
                  <Input
                    label={t('register.organization')}
                    value={validation.orgName}
                    disabled
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t('register.firstName')}
                    placeholder={t('register.firstNamePlaceholder')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                  <Input
                    label={t('register.lastName')}
                    placeholder={t('register.lastNamePlaceholder')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>

                <Input
                  label={t('profile.phone')}
                  type="tel"
                  placeholder="34612345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />

                {isFirebase ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleGoogleRegister}
                    loading={submitting}
                    disabled={!firstName.trim() || !lastName.trim()}
                    className="w-full"
                  >
                    {t('register.registerWithGoogle')}
                  </Button>
                ) : (
                  <form onSubmit={handleCredentialRegister} className="flex flex-col gap-3">
                    <Input
                      label={t('common.email')}
                      type="email"
                      placeholder={t('register.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={!!validation?.email}
                    />
                    <Input
                      label={t('register.passwordLabel')}
                      type="password"
                      placeholder={t('register.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <Input
                      label={t('register.confirmPassword')}
                      type="password"
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={submitting}
                      disabled={!email || !password || !confirmPassword}
                      className="w-full mt-2"
                    >
                      {t('register.createAccountButton')}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
