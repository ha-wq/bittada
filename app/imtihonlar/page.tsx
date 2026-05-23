"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { formatDateTime } from "@/lib/format";
import { UniLogo } from "@/components/UniLogo";

export default function ExamsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const exams = user.applications
    .map((a) => a.examRegistration)
    .filter((r): r is NonNullable<typeof r> => !!r);

  const examsWithUni = user.applications
    .filter((a) => a.examRegistration)
    .map((a) => ({
      reg: a.examRegistration!,
      university: a.university,
    }));

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
          {examsWithUni.map(({ reg, university }) => (
            <div key={reg.id} className="border border-hairline rounded-md p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-md bg-surface-strong flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <UniLogo
                    logo={university.logo}
                    alt={university.name}
                    className="w-full h-full object-cover"
                    textClassName="text-2xl font-bold text-ink/30"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-[18px] font-semibold text-ink">
                    {university.name}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4 text-[14px]">
                    <div>
                      <div className="text-muted">Sana</div>
                      <div className="font-medium text-ink mt-0.5">
                        {formatDateTime(reg.exam.date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted">Manzil</div>
                      <div className="font-medium text-ink mt-0.5">
                        {reg.exam.location}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-muted">Topshiriladigan fanlar</div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {reg.exam.subjects.map((s) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
