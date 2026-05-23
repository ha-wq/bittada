"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button, Input } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await signIn(form.email, form.password);
      if (u.role === "STUDENT") {
        setError("Bu hisob admin emas.");
        return;
      }
      router.push(u.role === "SUPER_ADMIN" ? "/admin/super" : "/admin/universitet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirish xatoligi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-4">
      <div className="bg-canvas border border-hairline rounded-md max-w-md w-full p-8 shadow-card">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
            B
          </span>
          <span className="text-xl font-semibold">bittada</span>
          <span className="text-[11px] font-bold uppercase tracking-wide bg-ink text-white px-2 py-0.5 rounded">
            Admin
          </span>
        </div>

        <h1 className="text-[24px] font-bold text-ink">Admin paneliga kirish</h1>
        <p className="text-[14px] text-muted mt-1">
          Universitet yoki super-admin hisobingiz bilan kiring.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Parol"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-[14px] text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Kirilmoqda..." : "Kirish"}
          </Button>
        </form>
      </div>
    </div>
  );
}
