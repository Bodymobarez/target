import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function SignIn() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      navigate(from, { replace: true });
      return;
    }
    setError(result.error === "Invalid email or password" ? t("auth.invalidEmailOrPassword") : result.error ?? t("error"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-secondary/20">
      <div className="w-full max-w-md">
        <div className="card-premium rounded-2xl p-6 sm:p-8 shadow-premium">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t("auth.signIn")}</h1>
          <p className="text-muted-foreground text-center text-sm mb-6">{t("auth.hasAccount")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="signin-email" className="block text-sm font-medium mb-1.5">
                {t("auth.email")}
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="block text-sm font-medium mb-1.5">
                {t("auth.password")}
              </label>
              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-gold py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? t("loading") : t("auth.signIn")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="text-gold font-semibold hover:underline">
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
