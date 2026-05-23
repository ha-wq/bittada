"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button, Input } from "@/components/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-8 py-16">
      <h1 className="text-[28px] font-bold text-ink">Ro'yxatdan o'tish</h1>
      <p className="text-[15px] text-muted mt-2">
        Bepul hisob yarating va ariza topshirishni boshlang.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label="To'liq ism"
          name="fullName"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Aliyev Anvar"
        />
        <Input
          label="Tug'ilgan sana"
          name="dateOfBirth"
          type="date"
          required
          value={form.dateOfBirth}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="siz@misol.uz"
        />
        <Input
          label="Parol"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          hint="Kamida 6 belgidan iborat"
        />

        {error && <p className="text-[14px] text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Yaratilmoqda..." : "Hisob yaratish"}
        </Button>

        <p className="text-[14px] text-muted text-center pt-2">
          Hisobingiz bormi?{" "}
          <Link href="/kirish" className="text-ink font-medium underline">
            Kiring
          </Link>
        </p>
      </form>
    </div>
  );
}
