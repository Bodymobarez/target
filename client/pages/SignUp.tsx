import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function SignUp() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await register(email.trim(), password, name.trim() || undefined);
    setLoading(false);
    if (result.ok) {
      navigate("/");
      return;
    }
    setError(
      result.error === "Email already registered" ? t("auth.emailAlreadyRegistered") : result.error ?? t("error")
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-secondary/20">
      <div className="w-full max-w-md">
        <div className="card-premium rounded-2xl p-6 sm:p-8 shadow-premium">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t("auth.signUp")}</h1>
          <p className="text-muted-foreground text-center text-sm mb-6">{t("auth.noAccount")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium mb-1.5">
                {t("auth.name")} <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
                placeholder="Ahmed"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">
                {t("auth.email")}
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">
                {t("auth.password")}
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
              {loading ? t("loading") : t("auth.register")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.hasAccount")}{" "}
            <Link to="/signin" className="text-gold font-semibold hover:underline">
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
