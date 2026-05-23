"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson, useAuth } from "@/lib/auth-context";
import { Exam, University } from "@/lib/types";
import { formatDateTime, formatSom } from "@/lib/format";
import { haptic } from "@/lib/telegram-webapp";

export default function TgExams() {
  const { user, refresh } = useAuth();
  const apps = user?.applications || [];

  // Exams the student is already registered for.
  const registered = useMemo(
    () =>
      apps
        .filter((a) => a.examRegistration)
        .map((a) => ({ reg: a.examRegistration!, uni: a.university })),
    [apps],
  );

  // Applications that still need an entrance exam.
  const needExam = useMemo(
    () =>
      apps.filter(
        (a) => a.needsEntranceExam && !a.examRegistration,
      ),
    [apps],
  );

  // Fetch available exams for the universities that need one.
  const [uniExams, setUniExams] = useState<Record<string, Exam[]>>({});
  useEffect(() => {
    const slugs = [...new Set(needExam.map((a) => a.university.slug))];
    slugs.forEach((slug) => {
      apiJson<University & { exams: Exam[] }>(`/api/universities/${slug}`)
        .then((u) =>
          setUniExams((prev) => ({ ...prev, [slug]: u.exams || [] })),
        )
        .catch(() => {});
    });
  }, [needExam]);

  const [busy, setBusy] = useState<string | null>(null);
  const register = async (examId: string, applicationId: string) => {
    setBusy(examId);
    try {
      await apiJson(`/api/exams/${examId}/register`, {
        body: { applicationId },
      });
      haptic("success");
      await refresh();
    } catch (e) {
      haptic("error");
      alert(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="px-4 pt-5">
      <h1 className="text-[22px] font-bold text-ink">Imtihonlar</h1>
      <p className="text-[14px] text-muted mt-1 mb-4">
        Ichki imtihonlarga yoziling va tafsilotlarni ko&apos;ring.
      </p>

      {/* Need-to-register section */}
      {needExam.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-semibold text-warning mb-2">
            Ro&apos;yxatdan o&apos;tish kerak
          </h2>
          <div className="space-y-3">
            {needExam.map((a) => {
              const exams = uniExams[a.university.slug] || [];
              return (
                <div
                  key={a.id}
                  className="border border-warning/30 bg-warning/5 rounded-lg p-3"
                >
                  <div className="text-[14px] font-semibold text-ink">
                    {a.university.name}
                  </div>
                  <div className="text-[12px] text-muted mb-2">
                    {a.major.name}
                  </div>
                  {exams.length === 0 ? (
                    <div className="text-[12px] text-muted">
                      Hozircha imtihon e&apos;lon qilinmagan.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {exams.map((ex) => (
                        <div
                          key={ex.id}
                          className="bg-canvas border border-hairline rounded-md p-2.5"
                        >
                          <div className="text-[13px] font-medium text-ink">
                            {formatDateTime(ex.date)}
                          </div>
                          <div className="text-[12px] text-muted">
                            {ex.location} ·{" "}
                            {ex.price > 0 ? formatSom(ex.price) : "Bepul"}
                          </div>
                          <button
                            onClick={() => register(ex.id, a.id)}
                            disabled={busy === ex.id}
                            className="mt-2 w-full h-9 rounded-md bg-primary text-white text-[13px] font-medium disabled:opacity-60"
                          >
                            {busy === ex.id ? "Yozilmoqda..." : "Yozilish"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Registered section */}
      <h2 className="text-[13px] font-semibold text-ink mb-2">
        Yozilgan imtihonlar
      </h2>
      {registered.length === 0 ? (
        <div className="bg-surface-soft rounded-lg p-8 text-center">
          <p className="text-[14px] text-muted">
            Hali hech qanday imtihonga yozilmagansiz.
          </p>
          <Link
            href="/tg/arizalar"
            className="inline-block mt-3 text-[14px] text-primary font-medium"
          >
            Arizalarni ko&apos;rish →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registered.map(({ reg, uni }) => (
            <div
              key={reg.id}
              className="border border-hairline rounded-lg p-3 bg-canvas"
            >
              <div className="text-[14px] font-semibold text-ink">
                {uni.name}
              </div>
              <div className="text-[13px] text-ink mt-1">
                {formatDateTime(reg.exam.date)}
              </div>
              <div className="text-[12px] text-muted">
                {reg.exam.location}
                {reg.exam.subjects?.length
                  ? ` · ${reg.exam.subjects.join(", ")}`
                  : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
