"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { formatDate, getUniversity } from "@/lib/mock-universities";

export default function ExamsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const exams = user.applications.filter(
    (a) => a.examRegistered && a.examDate,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-bold text-ink">Imtihonlar</h1>
      <p className="text-[15px] text-muted mt-2">
        Siz yozilgan ichki imtihonlar va ularning tafsilotlari.
      </p>

      {exams.length === 0 ? (
        <div className="bg-surface-soft rounded-md p-12 text-center mt-8">
          <p className="text-[16px] text-muted">
            Hozircha hech qanday imtihonga yozilmagansiz.
          </p>
          <Link
            href="/arizalar"
            className="text-[14px] text-ink font-medium underline mt-3 inline-block"
          >
            Arizalarni ko'rish
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mt-8">
          {exams.map((a) => {
            const uni = getUniversity(a.universityId);
            if (!uni) return null;
            return (
              <div key={a.id} className="border border-hairline rounded-md p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-md bg-surface-strong flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-ink/30">
                      {uni.logo}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[18px] font-semibold text-ink">
                      {uni.name}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4 text-[14px]">
                      <div>
                        <div className="text-muted">Sana</div>
                        <div className="font-medium text-ink mt-0.5">
                          {formatDate(a.examDate!)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted">Manzil</div>
                        <div className="font-medium text-ink mt-0.5">
                          {uni.address}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-muted">Topshiriladigan fanlar</div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {(uni.entranceExamSubjects || []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center px-3 py-1 rounded-full bg-surface-strong text-[13px] font-medium text-ink"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
