"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth-context";
import { APPLICATION_STATUS_LABEL, formatDate, PART_OF_DAY_LABEL } from "@/lib/format";
import { ApplicationStatus } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

type AdminApp = {
  id: string;
  status: ApplicationStatus;
  partOfDay: string;
  financialAid: boolean;
  submittedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    profile: {
      phone: string | null;
      school: string | null;
      passportId: string | null;
      graduationYear: string | null;
      photo: string | null;
      idCardFront: string | null;
      idCardBack: string | null;
      diploma: string | null;
      ielts: { overall?: string; certificate?: string } | null;
      dtm: { total?: string; certificate?: string } | null;
      sat: { total?: string; certificate?: string } | null;
      milliySertifikat: {
        subjects?: { subject: string; score: string; certificate?: string }[];
      } | null;
    } | null;
  };
  major: { name: string };
};

type FileRef = { label: string; file: string };

function isImage(name: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

const VARIANT: Record<ApplicationStatus, "neutral" | "warning" | "success" | "error"> = {
  YUBORILMAGAN: "neutral",
  KORIB_CHIQILMOQDA: "warning",
  QABUL_QILINDI: "success",
  RAD_ETILDI: "error",
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<AdminApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");

  const load = () => {
    apiJson<AdminApp[]>("/api/admin/applications").then((d) => {
      setApps(d);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const decide = async (id: string, status: ApplicationStatus) => {
    await apiJson(`/api/admin/applications/${id}`, {
      method: "PATCH",
      body: { status },
    });
    load();
  };

  const filtered = apps.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-ink">Kelgan arizalar</h1>
          <p className="text-[15px] text-muted mt-1">
            Jami: {apps.length} ta ariza
          </p>
        </div>
        <a
          href="/api/admin/applications/export"
          className="inline-flex h-11 items-center px-5 rounded-md bg-ink text-white text-[14px] font-medium hover:opacity-90"
        >
          ⬇ Excel ga eksport
        </a>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            { v: "all", l: "Hammasi" },
            { v: "KORIB_CHIQILMOQDA", l: "Ko'rib chiqilmoqda" },
            { v: "QABUL_QILINDI", l: "Qabul qilingan" },
            { v: "RAD_ETILDI", l: "Rad etilgan" },
          ] as const
        ).map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v as "all" | ApplicationStatus)}
            className={`h-10 px-4 rounded-full text-[14px] font-medium border ${
              filter === f.v
                ? "bg-ink text-white border-ink"
                : "bg-canvas text-ink border-hairline hover:border-ink"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-soft rounded-md p-12 text-center text-muted">
          Hech qanday ariza yo'q.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const p = a.user.profile;
            return (
              <div key={a.id} className="border border-hairline rounded-md p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="text-[17px] font-semibold text-ink">
                        {a.user.fullName}
                      </h3>
                      <span className="text-[13px] text-muted">{a.user.email}</span>
                    </div>
                    <div className="text-[14px] text-muted mt-1">
                      {a.major.name} · {PART_OF_DAY_LABEL[a.partOfDay]}
                      {a.financialAid && " · Grant"}
                    </div>
                    {a.submittedAt && (
                      <div className="text-[13px] text-muted mt-1">
                        Yuborilgan: {formatDate(a.submittedAt)}
                      </div>
                    )}

                    {p && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-[13px]">
                        {p.phone && <Stat label="Telefon" v={p.phone} />}
                        {(p.passportId || p.idCardFront || p.idCardBack) && (
                          <Stat
                            label="Passport"
                            v={p.passportId || "—"}
                            files={[
                              p.idCardFront && {
                                label: "ID karta (old)",
                                file: p.idCardFront,
                              },
                              p.idCardBack && {
                                label: "ID karta (orqa)",
                                file: p.idCardBack,
                              },
                            ].filter(Boolean) as FileRef[]}
                          />
                        )}
                        {(p.school || p.diploma) && (
                          <Stat
                            label="Maktab"
                            v={p.school || "—"}
                            files={
                              p.diploma
                                ? [{ label: "Diplom / attestat", file: p.diploma }]
                                : []
                            }
                          />
                        )}
                        {p.graduationYear && (
                          <Stat label="Bitirgan" v={p.graduationYear} />
                        )}
                        {(p.dtm?.total || p.dtm?.certificate) && (
                          <Stat
                            label="DTM"
                            v={p.dtm?.total || "—"}
                            files={
                              p.dtm?.certificate
                                ? [{ label: "DTM sertifikati", file: p.dtm.certificate }]
                                : []
                            }
                          />
                        )}
                        {(p.ielts?.overall || p.ielts?.certificate) && (
                          <Stat
                            label="IELTS"
                            v={p.ielts?.overall || "—"}
                            files={
                              p.ielts?.certificate
                                ? [
                                    {
                                      label: "IELTS sertifikati",
                                      file: p.ielts.certificate,
                                    },
                                  ]
                                : []
                            }
                          />
                        )}
                        {(p.sat?.total || p.sat?.certificate) && (
                          <Stat
                            label="SAT"
                            v={p.sat?.total || "—"}
                            files={
                              p.sat?.certificate
                                ? [{ label: "SAT sertifikati", file: p.sat.certificate }]
                                : []
                            }
                          />
                        )}
                        {p.milliySertifikat?.subjects?.map((s, i) =>
                          s.subject || s.score || s.certificate ? (
                            <Stat
                              key={i}
                              label={`Milliy — ${s.subject || "—"}`}
                              v={s.score || "—"}
                              files={
                                s.certificate
                                  ? [
                                      {
                                        label: "Sertifikat",
                                        file: s.certificate,
                                      },
                                    ]
                                  : []
                              }
                            />
                          ) : null,
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={VARIANT[a.status]}>
                      {APPLICATION_STATUS_LABEL[a.status]}
                    </Badge>
                    {p?.photo && (
                      <div className="relative group">
                        <a
                          href={`/api/files/${p.photo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Rasmni ko'rish"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/files/${p.photo}`}
                            alt={a.user.fullName}
                            className="w-32 h-32 rounded-md object-cover border border-hairline"
                          />
                        </a>
                        <a
                          href={`/api/files/${p.photo}?download=1`}
                          download={p.photo}
                          className="absolute bottom-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-md bg-ink/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Yuklab olish"
                          aria-label="Profil rasmini yuklab olish"
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13h10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap items-center">
                  {a.status !== "QABUL_QILINDI" && (
                    <Button
                      size="sm"
                      onClick={() => decide(a.id, "QABUL_QILINDI")}
                    >
                      Qabul qilish
                    </Button>
                  )}
                  {a.status !== "RAD_ETILDI" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => decide(a.id, "RAD_ETILDI")}
                    >
                      Rad etish
                    </Button>
                  )}
                  {a.status !== "KORIB_CHIQILMOQDA" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => decide(a.id, "KORIB_CHIQILMOQDA")}
                    >
                      Qaytarish
                    </Button>
                  )}
                  <a
                    href={`/api/admin/applications/${a.id}/export`}
                    className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-hairline text-[13px] font-medium text-ink hover:border-ink hover:bg-surface-soft"
                    title="Talaba ma'lumotlari va fayllarini ZIP shaklida yuklab olish"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    ZIP yuklab olish
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  v,
  files = [],
}: {
  label: string;
  v: string;
  files?: FileRef[];
}) {
  const hasFiles = files.length > 0;
  return (
    <div
      className={`group/stat relative -mx-2 px-2 py-1 rounded-md ${
        hasFiles ? "hover:bg-surface-soft" : ""
      }`}
    >
      <div className="text-muted text-[12px]">{label}</div>
      <div className="flex items-center gap-2 min-h-[20px]">
        {v && <div className="text-ink font-medium">{v}</div>}
        {hasFiles && (
          <div className="flex items-center gap-1 opacity-0 group-hover/stat:opacity-100 transition-opacity">
            {files.map((f) => (
              <FileActions key={f.file} label={f.label} file={f.file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileActions({ label, file }: { label: string; file: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 border border-hairline rounded-md bg-canvas">
      <a
        href={`/api/files/${file}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-6 h-6 text-muted hover:text-ink hover:bg-surface-soft rounded-l-md"
        title={`Ko'rish: ${label}`}
        aria-label={`${label} ni ko'rish`}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </a>
      <a
        href={`/api/files/${file}?download=1`}
        download={file}
        className="inline-flex items-center justify-center w-6 h-6 text-muted hover:text-ink hover:bg-surface-soft rounded-r-md border-l border-hairline"
        title={`Yuklab olish: ${label}`}
        aria-label={`${label} ni yuklab olish`}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </span>
  );
}
