"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Application, Profile, User } from "./types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
    dateOfBirth: string;
  }) => User;
  signIn: (email: string, password: string) => User | null;
  signOut: () => void;
  updateProfile: (profile: Profile) => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  removeApplication: (id: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "bittada:user";
const ACCOUNTS_KEY = "bittada:accounts";

type StoredAccount = { email: string; password: string; user: User };

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      const accounts = loadAccounts();
      const idx = accounts.findIndex((a) => a.user.id === u.id);
      if (idx >= 0) {
        accounts[idx].user = u;
        saveAccounts(accounts);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const signUp: AuthContextValue["signUp"] = (data) => {
    const accounts = loadAccounts();
    const newUser: User = {
      id: crypto.randomUUID(),
      fullName: data.fullName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      applications: [],
    };
    accounts.push({ email: data.email, password: data.password, user: newUser });
    saveAccounts(accounts);
    persist(newUser);
    return newUser;
  };

  const signIn: AuthContextValue["signIn"] = (email, password) => {
    const accounts = loadAccounts();
    const acc = accounts.find(
      (a) => a.email === email && a.password === password,
    );
    if (!acc) return null;
    persist(acc.user);
    return acc.user;
  };

  const signOut = () => persist(null);

  const updateProfile = (profile: Profile) => {
    if (!user) return;
    persist({ ...user, profile });
  };

  const addApplication = (app: Application) => {
    if (!user) return;
    persist({ ...user, applications: [...user.applications, app] });
  };

  const updateApplication = (id: string, patch: Partial<Application>) => {
    if (!user) return;
    persist({
      ...user,
      applications: user.applications.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    });
  };

  const removeApplication = (id: string) => {
    if (!user) return;
    persist({
      ...user,
      applications: user.applications.filter((a) => a.id !== id),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        addApplication,
        updateApplication,
        removeApplication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function isProfileComplete(profile?: Profile): boolean {
  if (!profile) return false;
  return Boolean(
    profile.school &&
      profile.phone &&
      profile.country &&
      profile.citizenship &&
      profile.address &&
      profile.passportId &&
      profile.graduationYear &&
      profile.diplomaUploaded,
  );
}
