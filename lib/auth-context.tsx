"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Profile, User } from "./types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
    dateOfBirth: string;
    role?: "STUDENT" | "PARENT";
  }) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type ApiInit = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function apiJson<T>(url: string, init?: ApiInit): Promise<T> {
  const { body, method, headers } = init || {};
  const res = await fetch(url, {
    method: method || (body !== undefined ? "POST" : "GET"),
    headers: {
      "content-type": "application/json",
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `So'rovda xatolik (${res.status})`);
  return data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const u = await apiJson<User | null>("/api/me");
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signUp: AuthContextValue["signUp"] = async (data) => {
    await apiJson("/api/auth/signup", { body: data });
    await refresh();
    return (await apiJson<User>("/api/me"))!;
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    await apiJson("/api/auth/login", { body: { email, password } });
    await refresh();
    return (await apiJson<User>("/api/me"))!;
  };

  const signOut = async () => {
    await apiJson("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function isProfileComplete(profile?: Profile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.school &&
      profile.phone &&
      profile.country &&
      profile.citizenship &&
      profile.address &&
      profile.passportId &&
      profile.graduationYear &&
      profile.diploma &&
      profile.idCardFront &&
      profile.idCardBack,
  );
}

export { apiJson };
