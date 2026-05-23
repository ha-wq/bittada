"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  formatDate,
  getUniversity,
  PART_OF_DAY_LABEL,
} from "@/lib/mock-universities";
import { Application, ApplicationStatus } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  yuborilmagan: "Yuborilmagan",
  korib_chiqilmoqda: "Ko'rib chiqilmoqda",
  qabul_qilindi: "Qabul qilindi",
  rad_etildi: "Rad etildi",
};

const STATUS_VARIANT: Record<
  ApplicationStatus,
  "neutral" | "warning" | "success" | "error"
> = {
  yuborilmagan: "neutral",
  korib_chiqilmoqda: "warning",
  qabul_qilindi: "success",
  rad_etildi: "error",
};

export default function ApplicationsPage() {
  const { user, loading, updateApplication, removeApplication } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const drafts = user.applications.filter(
    (a) => a.status === "yuborilmagan" && !a.needsEntranceExam,
  );
  const examNeeded = user.applications.filter(
    (a) => a.status === "yuborilmagan" && a.needsEntranceExam,
  );
  const submitted = user.applications.filter(
    (a) => a.status !== "yuborilmagan",
  );

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const submitAll = () => {
    selected.forEach((id) =>
      updateApplication(id, { status: "korib_chiqilmoqda" }),
    );
    setSelected(new Set());
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-[28px] font-bold text-ink">Mening arizalarim</h1>
        <Link
          href="/dashboard"
          className="text-[14px] text-muted hover:text-ink underline"
        >
          + Universitet qo'shish
        </Link>
      </div>

      {user.applications.length === 0 && (
        <div className="bg-surface-soft rounded-md p-12 text-center">
          <p className="text-[16px] text-muted">
            Hozircha hech qanday ariza yo'q.
          </p>
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
                onRemove={() => removeApplication(a.id)}
              />
            ))}
          </div>
          {selected.size > 0 && (
            <div className="mt-5 sticky bottom-4 bg-ink text-white rounded-md p-4 flex items-center justify-between shadow-card">
              <span className="text-[14px]">
                {selected.size} ta ariza tanlandi
              </span>
              <Button
                onClick={submitAll}
                className="bg-primary text-white hover:bg-primary-active border-0"
              >
                Yuborish
              </Button>
            </div>
          )}
        </Block>
      )}

      {examNeeded.length > 0 && (
        <Block title={`Imtihon talab qilinadi (${examNeeded.length})`}>
          <p className="text-[14px] text-muted mb-3">
            Sizning natijalaringiz bu universitetlarning talablariga to'g'ri
            kelmaydi. Ichki imtihonga yoziling.
          </p>
          <div className="space-y-3">
            {examNeeded.map((a) => (
              <AppRow
                key={a.id}
                app={a}
                onRegisterExam={() => {
                  const examDate = new Date(
                    Date.now() + 14 * 24 * 60 * 60 * 1000,
                  ).toISOString();
                  updateApplication(a.id, {
                    examRegistered: true,
                    examDate,
                    needsEntranceExam: false,
                  });
                }}
                onRemove={() => removeApplication(a.id)}
              />
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
  onToggle,
  onRemove,
  onRegisterExam,
}: {
  app: Application;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  onRegisterExam?: () => void;
}) {
  const uni = getUniversity(app.universityId);
  if (!uni) return null;
  const major = uni.majors.find((m) => m.id === app.majorId);

  return (
    <div className="border border-hairline rounded-md p-5 flex items-start gap-4">
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-5 h-5 mt-1 accent-primary"
        />
      )}
      <div className="h-14 w-14 rounded-md bg-surface-strong flex items-center justify-center flex-shrink-0">
        <span className="text-2xl font-bold text-ink/30">{uni.logo}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              href={`/universitetlar/${uni.id}`}
              className="text-[16px] font-semibold text-ink hover:underline"
            >
              {uni.name}
            </Link>
            <div className="text-[14px] text-muted mt-0.5">
              {major?.name} · {PART_OF_DAY_LABEL[app.partOfDay]}
              {app.financialAid && " · Grant"}
            </div>
            {app.examRegistered && app.examDate && (
              <div className="text-[13px] text-success mt-1">
                ✓ Imtihonga yozilgan: {formatDate(app.examDate)}
              </div>
            )}
          </div>
          <Badge variant={STATUS_VARIANT[app.status]}>
            {STATUS_LABEL[app.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mt-3">
          {onRegisterExam && (
            <Button size="sm" onClick={onRegisterExam}>
              Imtihonga yozilish
            </Button>
          )}
          {onRemove && app.status === "yuborilmagan" && (
            <button
              onClick={onRemove}
              className="text-[13px] text-muted hover:text-error underline"
            >
              O'chirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
