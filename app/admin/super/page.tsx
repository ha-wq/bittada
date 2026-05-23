"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth-context";
import { University } from "@/lib/types";
import { Button, Input, Select } from "@/components/ui";

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "UNIVERSITY_ADMIN" | "SUPER_ADMIN";
  manages: { name: string; shortName: string } | null;
};

export default function SuperAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", universityId: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    apiJson<AdminUser[]>("/api/admin/users").then(setUsers);
  };

  useEffect(() => {
    load();
    apiJson<University[]>("/api/universities").then(setUnis);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiJson("/api/admin/users", { body: form });
      setForm({ fullName: "", email: "", password: "", universityId: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yaratishda xatolik.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-bold text-ink">Admin foydalanuvchilar</h1>
      <p className="text-[15px] text-muted mt-2">
        Universitet adminlarini yarating va boshqaring.
      </p>

      <form onSubmit={submit} className="mt-8 bg-surface-soft rounded-md p-5 space-y-4">
        <h2 className="text-[18px] font-semibold text-ink">
          Yangi universitet admini
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="To'liq ism"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Parol (kamida 6 belgi)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Select
            label="Universitet"
            value={form.universityId}
            onChange={(e) => setForm({ ...form, universityId: e.target.value })}
            required
          >
            <option value="">Tanlang...</option>
            {unis.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName} — {u.name}
              </option>
            ))}
          </Select>
        </div>
        {error && <p className="text-[14px] text-error">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? "Yaratilmoqda..." : "Yaratish"}
        </Button>
      </form>

      <div className="mt-10">
        <h2 className="text-[20px] font-semibold text-ink mb-4">
          Mavjud adminlar ({users.length})
        </h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="border border-hairline rounded-md p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <div className="text-[15px] font-semibold text-ink">
                  {u.fullName}
                </div>
                <div className="text-[13px] text-muted">{u.email}</div>
              </div>
              <div className="text-right text-[13px]">
                <div className="font-medium text-ink">
                  {u.role === "SUPER_ADMIN" ? "Super admin" : "Universitet admin"}
                </div>
                <div className="text-muted">{u.manages?.shortName || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
