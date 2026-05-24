"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiJson, useAuth } from "@/lib/auth-context";
import { getWebApp } from "@/lib/telegram-webapp";

type Phase = "loading" | "need-login" | "ready";

type TgContextValue = {
  phase: Phase;
  /** True when running inside the Telegram client. */
  inTelegram: boolean;
  /** Retry Telegram auto-login. */
  retry: () => void;
};

const TgContext = createContext<TgContextValue | null>(null);

export function TgProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, refresh } = useAuth();
  const [phase, setPhase] = useState<Phase>("loading");
  const [inTelegram, setInTelegram] = useState(false);
  const [tries, setTries] = useState(0);

  // Apply Telegram theme + expand the viewport.
  useEffect(() => {
    const wa = getWebApp();
    if (wa) {
      setInTelegram(true);
      try {
        wa.ready();
        wa.expand();
      } catch {
        /* noop */
      }
    }
  }, []);

  // Ensure the Telegram auth POST is fired only once per attempt.
  // Starts at -1 (no attempt yet) so the first round (tries === 0) runs;
  // initializing to 0 would make the guard below skip the very first auth.
  const attempted = useRef(-1);

  // Bootstrap auth. If we're inside Telegram, authenticate immediately with
  // initData — don't wait for the initial /api/me round-trip. Otherwise fall
  // back to the email/password form once /api/me settles.
  useEffect(() => {
    // Already signed in (returning user / email login completed).
    if (user) {
      setPhase("ready");
      return;
    }

    const initData = getWebApp()?.initData;

    if (!initData) {
      // No Telegram context: decide once the session check finishes.
      if (!loading) setPhase("need-login");
      return;
    }

    if (attempted.current === tries) return; // already tried this round
    attempted.current = tries;

    let cancelled = false;
    setPhase("loading");
    apiJson("/api/tg/auth", { body: { initData } })
      .then(() => refresh())
      .then(() => {
        if (!cancelled) setPhase("ready");
      })
      .catch(() => {
        if (!cancelled) setPhase("need-login");
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user, refresh, tries]);

  const retry = () => setTries((t) => t + 1);

  return (
    <TgContext.Provider value={{ phase, inTelegram, retry }}>
      {children}
    </TgContext.Provider>
  );
}

export function useTg() {
  const ctx = useContext(TgContext);
  if (!ctx) throw new Error("useTg must be used within TgProvider");
  return ctx;
}
