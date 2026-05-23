"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button, Input } from "@/components/ui";

export default function SignInPage() {
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
      if (u.role === "UNIVERSITY_ADMIN" || u.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email yoki parol noto'g'ri.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-8 py-16">
      <h1 className="text-[28px] font-bold text-ink">Hisobga kirish</h1>
      <p className="text-[15px] text-muted mt-2">
        Davom etish uchun email va parolingizni kiriting.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Parol"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-[14px] text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Kirilmoqda..." : "Kirish"}
        </Button>

        <p className="text-[14px] text-muted text-center pt-2">
          Hisobingiz yo'qmi?{" "}
          <Link href="/royxat" className="text-ink font-medium underline">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </form>
    </div>
  );
}
