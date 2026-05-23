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
      ielts: { overall?: string } | null;
      dtm: { total?: string } | null;
      sat: { total?: string } | null;
    } | null;
  };
  major: { name: string };
};

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
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[13px]">
                        {p.phone && <Stat label="Telefon" v={p.phone} />}
                        {p.passportId && <Stat label="Passport" v={p.passportId} />}
                        {p.school && <Stat label="Maktab" v={p.school} />}
                        {p.graduationYear && (
                          <Stat label="Bitirgan" v={p.graduationYear} />
                        )}
                        {p.dtm?.total && <Stat label="DTM" v={p.dtm.total} />}
                        {p.ielts?.overall && <Stat label="IELTS" v={p.ielts.overall} />}
                        {p.sat?.total && <Stat label="SAT" v={p.sat.total} />}
                      </div>
                    )}
                  </div>
                  <Badge variant={VARIANT[a.status]}>
                    {APPLICATION_STATUS_LABEL[a.status]}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-4">
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="text-muted text-[12px]">{label}</div>
      <div className="text-ink font-medium">{v}</div>
    </div>
  );
}
