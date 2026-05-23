"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Wordmark } from "@/components/Wordmark";
import { useTg } from "./tg-context";

export function TgLogin() {
  const { signIn } = useAuth();
  const { inTelegram, retry } = useTg();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(form.email, form.password);
      // useAuth.user updates → TgProvider flips phase to "ready".
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirish xatoligi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas px-5 py-10 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Wordmark size={26} />
      </div>

      <h1 className="text-[24px] font-bold text-ink">Xush kelibsiz</h1>
      <p className="text-[14px] text-muted mt-1">
        {inTelegram
          ? "Telegram orqali avtomatik kirish amalga oshmadi. Email bilan kiring yoki qayta urining."
          : "Davom etish uchun hisobingizga kiring."}
      </p>

      {inTelegram && (
        <button
          onClick={retry}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#229ED9] text-white text-[15px] font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.4 13l-4.8-1.5c-1-.3-1-1 .2-1.5l18.7-7.2c.9-.3 1.6.2 1.4 1.5z" />
          </svg>
          Telegram orqali qayta kirish
        </button>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-[14px] font-medium text-ink mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full h-12 px-4 rounded-md border border-hairline bg-canvas text-[15px] focus:border-ink outline-none"
          />
        </div>
        <div>
          <label className="block text-[14px] font-medium text-ink mb-1.5">
            Parol
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full h-12 px-4 rounded-md border border-hairline bg-canvas text-[15px] focus:border-ink outline-none"
          />
        </div>
        {error && <p className="text-[14px] text-error">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-md bg-primary text-white text-[15px] font-medium hover:bg-primary-active transition-colors disabled:opacity-60"
        >
          {submitting ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>

      <p className="text-[13px] text-muted mt-6 text-center">
        Hisobingiz yo&apos;qmi?{" "}
        <a href="/royxat" className="text-primary font-medium">
          Ro&apos;yxatdan o&apos;tish
        </a>
      </p>
    </div>
  );
}
