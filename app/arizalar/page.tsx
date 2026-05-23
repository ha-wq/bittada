"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiJson } from "@/lib/auth-context";
import { UniLogo } from "@/components/UniLogo";
import {
  APPLICATION_STATUS_LABEL,
  formatDate,
  formatSom,
  PART_OF_DAY_LABEL,
} from "@/lib/format";
import { Application, ApplicationStatus, Exam } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

const STATUS_VARIANT: Record<
  ApplicationStatus,
  "neutral" | "warning" | "success" | "error"
> = {
  YUBORILMAGAN: "neutral",
  KORIB_CHIQILMOQDA: "warning",
  QABUL_QILINDI: "success",
  RAD_ETILDI: "error",
};

export default function ApplicationsPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [examModalApp, setExamModalApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const drafts = user.applications.filter(
    (a) => a.status === "YUBORILMAGAN" && !a.needsEntranceExam,
  );
  const examNeeded = user.applications.filter(
    (a) => a.status === "YUBORILMAGAN" && a.needsEntranceExam,
  );
  const submitted = user.applications.filter(
    (a) => a.status !== "YUBORILMAGAN",
  );

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const submitAll = async () => {
    setBusy(true);
    try {
      await apiJson("/api/applications/submit", {
        body: { ids: Array.from(selected) },
      });
      setSelected(new Set());
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const removeApp = async (id: string) => {
    await apiJson(`/api/applications/${id}`, { method: "DELETE" });
    await refresh();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-[28px] font-bold text-ink">Mening arizalarim</h1>
        <Link
          href="/dashboard"
          className="text-[14px] font-medium rounded-md px-3 py-1.5 bg-primary text-white hover:bg-primary-active transition-colors"
        >
          + Universitet qo'shish
        </Link>
      </div>

      {user.applications.length === 0 && (
        <div className="bg-surface-soft rounded-md p-12 text-center">
          <p className="text-[16px] text-muted">Hozircha hech qanday ariza yo'q.</p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center px-5 mt-4 rounded-md bg-primary text-white font-medium hover:bg-primary-active"
          >
            Universitetlarni ko'rish
          </Link>
        </div>
      )}

      {drafts.length > 0 && (
        <Block title={`Tayyor (${drafts.length})`}>
          <p className="text-[14px] text-muted mb-3">
            Yubormoqchi bo'lgan universitetlaringizni belgilang va yuboring.
          </p>
          <div className="space-y-3">
            {drafts.map((a) => (
              <AppRow
                key={a.id}
                app={a}
                selectable
                selected={selected.has(a.id)}
                onToggle={() => toggle(a.id)}
                onRemove={() => removeApp(a.id)}
              />
            ))}
          </div>
          {selected.size > 0 && (
            <div className="mt-5 sticky bottom-4 bg-ink text-white rounded-md p-4 flex items-center justify-between shadow-card">
              <span className="text-[14px]">{selected.size} ta ariza tanlandi</span>
              <Button
                onClick={submitAll}
                disabled={busy}
                className="bg-primary text-white hover:bg-primary-active border-0"
              >
                {busy ? "Yuborilmoqda..." : "Yuborish"}
              </Button>
            </div>
          )}
        </Block>
      )}

      {examNeeded.length > 0 && (
        <Block title={`Imtihon talab qilinadi (${examNeeded.length})`}>
          <p className="text-[14px] text-muted mb-3">
            Sizning natijalaringiz bu universitetlarning talablariga to'g'ri kelmaydi.
            Universitet imtihon kunlarini e'lon qilganda yozilishingiz mumkin.
          </p>
          <div className="space-y-3">
            {examNeeded.map((a) => (
              <AppRow key={a.id} app={a} blocked
                onRegisterExam={() => setExamModalApp(a)}
                onRemove={() => removeApp(a.id)} />
            ))}
          </div>
        </Block>
      )}

      {submitted.length > 0 && (
        <Block title={`Yuborilgan (${submitted.length})`}>
          <div className="space-y-3">
            {submitted.map((a) => (
              <AppRow key={a.id} app={a} />
            ))}
          </div>
        </Block>
      )}

      {examModalApp && (
        <ExamPickerModal
          app={examModalApp}
          onClose={() => setExamModalApp(null)}
          onSuccess={async () => { await refresh(); setExamModalApp(null); }}
        />
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[20px] font-semibold text-ink mb-3">{title}</h2>
      {children}
    </section>
  );
}

function AppRow({
  app,
  selectable,
  selected,
  blocked,
  onToggle,
  onRemove,
  onRegisterExam,
}: {
  app: Application;
  selectable?: boolean;
  selected?: boolean;
  blocked?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  onRegisterExam?: () => void;
}) {
  const uni = app.university;
  return (
    <div className={`border rounded-md p-5 flex items-start gap-4 ${blocked ? "border-primary/40 border-l-4 bg-primary/[0.03]" : "border-hairline"}`}>
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-5 h-5 mt-1 accent-primary"
        />
      )}
      <div className="h-14 w-14 rounded-md bg-surface-strong flex items-center justify-center flex-shrink-0 overflow-hidden">
        <UniLogo
          logo={uni.logo}
          alt={uni.name}
          className="w-full h-full object-cover"
          textClassName="text-2xl font-bold text-ink/30"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              href={`/universitetlar/${uni.slug}`}
              className="text-[16px] font-semibold text-ink hover:underline"
            >
              {uni.name}
            </Link>
            <div className="text-[14px] text-muted mt-0.5">
              {app.major.name} · {PART_OF_DAY_LABEL[app.partOfDay]}
              {app.financialAid && " · Grant"}
            </div>
            {app.examRegistration && (
              <div className="text-[13px] text-success mt-1">
                ✓ Imtihonga yozilgan: {formatDate(app.examRegistration.exam.date)}
              </div>
            )}
          </div>
          <Badge variant={blocked && app.status === "YUBORILMAGAN" ? "error" : STATUS_VARIANT[app.status]}>
            {APPLICATION_STATUS_LABEL[app.status]}
          </Badge>
        </div>

        {app.status === "YUBORILMAGAN" && (onRemove || (blocked && !app.examRegistration && onRegisterExam)) && (
          <div className="flex items-center gap-3 mt-3">
            {blocked && !app.examRegistration && onRegisterExam && (
              <button
                onClick={onRegisterExam}
                className="text-[13px] font-medium text-primary hover:underline"
              >
                Imtihonga yozilish →
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="text-[13px] text-muted hover:text-error underline"
              >
                O'chirish
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-canvas rounded-xl max-w-lg w-full p-6 shadow-card max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function ExamPickerModal({
  app,
  onClose,
  onSuccess,
}: {
  app: Application;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<{ exams: Exam[] } & Record<string, unknown>>(`/api/universities/${app.university.slug}`)
      .then((uni) => {
        const upcoming = (uni.exams ?? []).filter((e) => new Date(e.date) > new Date());
        setExams(upcoming);
        if (upcoming.length > 0) setSelectedExamId(upcoming[0].id);
      })
      .catch(() => setExams([]));
  }, [app.university.slug]);

  const register = async () => {
    if (!selectedExamId) return;
    setRegistering(true);
    setError(null);
    try {
      await apiJson(`/api/exams/${selectedExamId}/register`, {
        body: { applicationId: app.id },
      });
      await onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
      setRegistering(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-[20px] font-bold text-ink">Imtihon vaqtini tanlang</h2>
      <p className="text-[14px] text-muted mt-1">{app.university.name}</p>

      <div className="mt-5">
        {exams === null && (
          <p className="text-[14px] text-muted">Yuklanmoqda...</p>
        )}
        {exams?.length === 0 && (
          <div className="bg-surface-soft rounded-lg px-4 py-6 text-center">
            <p className="text-[14px] text-muted">Hozircha ochiq imtihon vaqtlari yo'q.</p>
            <p className="text-[13px] text-muted mt-1">Universitet e'lon qilganda bu yerda ko'rinadi.</p>
          </div>
        )}
        {exams && exams.length > 0 && (
          <div className="space-y-2">
            {exams.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedExamId(e.id)}
                className={`w-full text-left border rounded-lg p-4 transition-colors ${
                  selectedExamId === e.id
                    ? "border-primary bg-primary/[0.04]"
                    : "border-hairline hover:border-ink/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold text-ink">{formatDate(e.date)}</div>
                    <div className="text-[13px] text-muted mt-0.5">📍 {e.location}</div>
                    {e.subjects.length > 0 && (
                      <div className="text-[13px] text-muted mt-0.5">
                        {e.subjects.join(" · ")}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {e.price > 0 && (
                      <div className="text-[14px] font-semibold text-ink">{formatSom(e.price)}</div>
                    )}
                    <div className="text-[12px] text-muted mt-0.5">{e.capacity} o'rin</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-[13px] text-error mt-3">{error}</p>}

      <div className="flex gap-3 mt-5">
        <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
        {exams && exams.length > 0 && (
          <Button onClick={register} disabled={registering || !selectedExamId} className="flex-1">
            {registering ? "Yozilmoqda..." : "Yozilish"}
          </Button>
        )}
      </div>
    </Modal>
  );
}
