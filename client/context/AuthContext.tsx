import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthUser, AuthResponse, MeResponse } from "@shared/api";

const TOKEN_KEY = "target-auth-token";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setUser: (u: AuthUser | null) => void;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  useEffect(() => {
    if (!token) {
      setUserState(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setToken(null);
          setUserState(null);
          return;
        }
        return res.json() as Promise<MeResponse>;
      })
      .then((data) => {
        if (cancelled || !data) return;
        setUserState(data.user);
      })
      .catch(() => {
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, setToken]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as AuthResponse & { error?: string; message?: string };
        if (!res.ok) {
          return { ok: false, error: data.message ?? data.error ?? "Login failed" };
        }
        setToken(data.token);
        setUserState(data.user);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: "Network error" };
      }
    },
    [setToken]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = (await res.json()) as AuthResponse & { error?: string; message?: string };
        if (!res.ok) {
          return { ok: false, error: data.message ?? data.error ?? "Registration failed" };
        }
        setToken(data.token);
        setUserState(data.user);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: "Network error" };
      }
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUserState(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, [setToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout, setUser, setToken }),
    [user, token, loading, login, register, logout, setUser, setToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
