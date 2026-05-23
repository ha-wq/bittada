"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiJson, useAuth } from "@/lib/auth-context";
import { ApplicationStatus } from "@/lib/types";
import { APPLICATION_STATUS_LABEL, PART_OF_DAY_LABEL } from "@/lib/format";
import { UniLogo } from "@/components/UniLogo";
import { haptic } from "@/lib/telegram-webapp";

const BADGE: Record<ApplicationStatus, string> = {
  YUBORILMAGAN: "bg-surface-strong text-muted",
  KORIB_CHIQILMOQDA: "bg-warning/10 text-warning",
  QABUL_QILINDI: "bg-success/10 text-success",
  RAD_ETILDI: "bg-error/10 text-error",
};

export default function TgApplications() {
  const { user, refresh } = useAuth();
  const apps = user?.applications || [];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submittable = useMemo(
    () =>
      apps.filter(
        (a) => a.status === "YUBORILMAGAN" && !a.needsEntranceExam,
      ),
    [apps],
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiJson<{ submitted: number }>(
        "/api/applications/submit",
        { body: { ids } },
      );
      haptic("success");
      setMsg(`${res.submitted} ta ariza yuborildi.`);
      setSelected(new Set());
      await refresh();
    } catch (e) {
      haptic("error");
      setMsg(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    try {
      await apiJson(`/api/applications/${id}`, { method: "DELETE" });
      await refresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 pt-5">
      <h1 className="text-[22px] font-bold text-ink">Mening arizalarim</h1>
      <p className="text-[14px] text-muted mt-1 mb-4">
        Yuborilmagan arizalarni belgilab, bittada yuboring.
      </p>

      {msg && (
        <div className="mb-3 text-[13px] bg-surface-soft border border-hairline rounded-md p-3 text-ink">
          {msg}
        </div>
      )}

      {apps.length === 0 ? (
        <div className="bg-surface-soft rounded-lg p-10 text-center">
          <p className="text-[14px] text-muted">Hali ariza qo&apos;shmagansiz.</p>
          <Link
            href="/tg"
            className="inline-block mt-3 text-[14px] text-primary font-medium"
          >
            Universitetlarni ko&apos;rish →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const selectable =
              a.status === "YUBORILMAGAN" && !a.needsEntranceExam;
            return (
              <div
                key={a.id}
                className="border border-hairline rounded-lg p-3 bg-canvas"
              >
                <div className="flex items-start gap-3">
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggle(a.id)}
                      className="w-5 h-5 mt-0.5 accent-primary flex-shrink-0"
                    />
                  )}
                  <div className="h-10 w-10 rounded-md bg-surface-strong flex items-center justify-center overflow-hidden flex-shrink-0">
                    <UniLogo
                      logo={a.university.logo}
                      alt={a.university.shortName}
                      className="w-full h-full object-cover"
                      textClassName="text-base font-bold text-ink/40"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink leading-tight line-clamp-2">
                      {a.university.name}
                    </div>
                    <div className="text-[12px] text-muted mt-0.5">
                      {a.major.name} · {PART_OF_DAY_LABEL[a.partOfDay]}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${BADGE[a.status]}`}
                  >
                    {APPLICATION_STATUS_LABEL[a.status]}
                  </span>
                </div>

                {a.needsEntranceExam && a.status === "YUBORILMAGAN" && (
                  <div className="mt-2.5 text-[12px] bg-warning/10 text-warning rounded-md p-2.5">
                    Bu universitet ichki imtihon talab qiladi.{" "}
                    <Link href="/tg/imtihonlar" className="underline font-medium">
                      Imtihonga yoziling
                    </Link>
                    .
                  </div>
                )}

                {a.status === "YUBORILMAGAN" && (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => remove(a.id)}
                      disabled={busy}
                      className="text-[12px] text-error font-medium"
                    >
                      O&apos;chirish
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {submittable.length > 0 && (
        <div
          className="fixed bottom-[72px] inset-x-0 z-30 px-4 py-3 bg-canvas/95 backdrop-blur border-t border-hairline"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <div className="mx-auto max-w-lg">
            <button
              onClick={submit}
              disabled={busy || selected.size === 0}
              className="w-full h-12 rounded-md bg-primary text-white text-[15px] font-medium disabled:opacity-50"
            >
              {busy
                ? "Yuborilmoqda..."
                : `Yuborish (${selected.size}/${submittable.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
