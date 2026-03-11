import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthAdapter } from "../../hooks/useAuthAdapter";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t, i18n } = useTranslation();
  const adapter = useAuthAdapter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle redirect result on mount (mobile comes back here after Google redirect)
  useEffect(() => {
    let cancelled = false;
    adapter.handleRedirectResult().then((completed) => {
      if (completed && !cancelled) onLogin();
    }).catch((err) => {
      console.error("[LoginPage] Redirect result failed:", err);
      if (!cancelled) setError(err instanceof Error ? err.message : t('login.signInFailed'));
    });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adapter.loginWithCredentials(email, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await adapter.loginWithGoogle();
      onLogin();
    } catch (err) {
      console.error("[LoginPage] Google login failed:", err);
      setError(err instanceof Error ? err.message : t('login.signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  const isFirebase = adapter.strategyName === "firebase";

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
          <h1 className="text-2xl font-bold gradient-text">
            {t('login.signIn')}
          </h1>
          <p className="text-xs text-text-muted mt-2">
            {isFirebase
              ? t('login.signInGoogle')
              : t('login.enterCredentials')}
          </p>
        </div>

        <Card className="gradient-border">
          <CardContent>
            <div className="flex flex-col gap-4">
              {error && (
                <div className="px-3 py-2 bg-red-muted border border-red/20 rounded-[var(--radius-md)] animate-fade-in">
                  <p className="text-xs text-red">{error}</p>
                </div>
              )}

              {isFirebase ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoogleLogin}
                  loading={loading}
                  className="w-full"
                >
                  {t('login.signInGoogleButton')}
                </Button>
              ) : (
                <form onSubmit={handleCredentialLogin} className="flex flex-col gap-3">
                  <Input
                    label={t('login.email')}
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <Input
                    label={t('login.password')}
                    type="password"
                    placeholder={t('login.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={!email || !password}
                    className="w-full mt-2"
                  >
                    {t('login.signInButton')}
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6 gap-1.5">
          {([["en", "EN"], ["es", "ES"]] as const).map(([code, label]) => {
            const active = i18n.language.startsWith(code);
            return (
              <button
                key={code}
                onClick={() => i18n.changeLanguage(code)}
                className={`btn-press px-5 py-1.5 font-mono text-[11px] font-semibold tracking-wider rounded-[var(--radius-sm)] transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                  active
                    ? "bg-accent-dim text-accent shadow-[0_0_16px_rgba(59,130,246,0.15)] border border-accent/20"
                    : "text-text-dim hover:text-text-muted hover:bg-glass-subtle border border-transparent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
