"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, useAuth } from "@/lib/auth-context";

type Child = {
  linkId: string;
  status: "PENDING" | "APPROVED";
  child: {
    id: string;
    fullName: string;
    profileComplete: boolean;
    applicationCount: number;
  };
};

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
    if (!loading && user && user.role !== "PARENT") router.push("/dashboard");
  }, [user, loading, router]);

  const load = () =>
    apiJson<Child[]>("/api/parent/children").then(setChildren).catch(() => {});

  useEffect(() => {
    if (user?.role === "PARENT") load();
  }, [user]);

  if (loading || !user || user.role !== "PARENT") return null;

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await apiJson<{ childName: string }>("/api/parent/link", {
        body: { code },
      });
      setMsg(
        `So'rov yuborildi: ${res.childName}. Farzandingiz tasdiqlagach, ariza topshira olasiz.`,
      );
      setCode("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  const approved = children.filter((c) => c.status === "APPROVED");
  const pending = children.filter((c) => c.status === "PENDING");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-bold text-ink">Farzandlarim</h1>
      <p className="text-[15px] text-muted mt-2">
        Farzandingiz bergan kodni kiriting. U tasdiqlagach, uning nomidan ariza
        topshira olasiz.
      </p>

      <form
        onSubmit={addChild}
        className="mt-6 border border-hairline rounded-md p-5"
      >
        <div className="text-[14px] font-medium text-ink mb-2">
          Farzand kodini kiriting
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MASALAN: A3K9PX"
            className="flex-1 min-w-[180px] h-11 px-3 rounded-md border border-hairline bg-canvas font-mono tracking-[0.2em] text-[15px]"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="h-11 px-5 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
          >
            {busy ? "..." : "So'rov yuborish"}
          </button>
        </div>
        {msg && <p className="text-[13px] text-success mt-2">{msg}</p>}
        {error && <p className="text-[13px] text-error mt-2">{error}</p>}
      </form>

      {pending.length > 0 && (
        <div className="mt-6">
          <div className="text-[13px] font-semibold text-warning mb-2">
            Tasdiqlash kutilmoqda
          </div>
          <div className="space-y-2">
            {pending.map((c) => (
              <div
                key={c.linkId}
                className="border border-warning/30 bg-warning/5 rounded-md p-4 text-[14px] text-ink"
              >
                {c.child.fullName} — farzand tasdiqlashini kuting
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="text-[13px] font-semibold text-ink mb-2">
          Bog&apos;langan farzandlar
        </div>
        {approved.length === 0 ? (
          <div className="bg-surface-soft rounded-md p-8 text-center text-[14px] text-muted">
            Hali bog&apos;langan farzand yo&apos;q.
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map((c) => (
              <Link
                key={c.linkId}
                href={`/ota-ona/${c.child.id}`}
                className="block border border-hairline rounded-md p-4 hover:border-ink transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[16px] font-semibold text-ink">
                      {c.child.fullName}
                    </div>
                    <div className="text-[13px] text-muted mt-0.5">
                      {c.child.applicationCount} ta ariza ·{" "}
                      {c.child.profileComplete ? (
                        <span className="text-success">profil to&apos;liq</span>
                      ) : (
                        <span className="text-warning">profil to&apos;liq emas</span>
                      )}
                    </div>
                  </div>
                  <span className="text-muted">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
