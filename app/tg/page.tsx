"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson, useAuth } from "@/lib/auth-context";
import { Major, PartOfDay, University } from "@/lib/types";
import { formatDate, formatSom, PART_OF_DAY_LABEL } from "@/lib/format";
import { UniLogo } from "@/components/UniLogo";
import { haptic } from "@/lib/telegram-webapp";

export default function TgHome() {
  const { user, refresh } = useAuth();
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    apiJson<University[]>("/api/universities")
      .then(setUnis)
      .finally(() => setLoading(false));
  }, []);

  const appliedUniIds = useMemo(
    () => new Set((user?.applications || []).map((a) => a.universityId)),
    [user],
  );

  return (
    <div className="px-4 pt-5">
      <h1 className="text-[22px] font-bold text-ink">Universitetlar</h1>
      <p className="text-[14px] text-muted mt-1 mb-4">
        Ariza topshirish uchun universitetni tanlang.
      </p>

      {loading ? (
        <div className="py-16 text-center text-muted text-[14px]">
          Yuklanmoqda...
        </div>
      ) : (
        <div className="space-y-3">
          {unis.map((u) => (
            <UniCard
              key={u.id}
              uni={u}
              applied={appliedUniIds.has(u.id)}
              open={openId === u.id}
              onToggle={() => setOpenId((p) => (p === u.id ? null : u.id))}
              onApplied={async () => {
                await refresh();
                setOpenId(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UniCard({
  uni,
  applied,
  open,
  onToggle,
  onApplied,
}: {
  uni: University;
  applied: boolean;
  open: boolean;
  onToggle: () => void;
  onApplied: () => void;
}) {
  return (
    <div className="border border-hairline rounded-lg overflow-hidden bg-canvas">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className="h-12 w-12 rounded-md bg-surface-strong flex items-center justify-center overflow-hidden flex-shrink-0">
          <UniLogo
            logo={uni.logo}
            alt={uni.shortName}
            className="w-full h-full object-cover"
            textClassName="text-lg font-bold text-ink/40"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-ink leading-tight line-clamp-2">
            {uni.name}
          </div>
          <div className="text-[13px] text-muted mt-0.5">
            {uni.city} · Muddat: {formatDate(uni.deadline)}
          </div>
        </div>
        {applied && (
          <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-1 rounded-full flex-shrink-0">
            Qo&apos;shilgan
          </span>
        )}
      </button>

      {open && (
        <div className="border-t border-hairline-soft p-3">
          <div className="text-[13px] text-body leading-relaxed mb-3">
            {uni.description}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[13px] mb-3">
            <Info label="O'qish narxi" v={`${formatSom(uni.tuitionMin)}`} />
            <Info label="Ta'lim tili" v={uni.language.join(", ") || "—"} />
          </div>
          {applied ? (
            <div className="text-[13px] text-muted bg-surface-soft rounded-md p-3 text-center">
              Bu universitetga ariza qo&apos;shgansiz. «Arizalar» bo&apos;limida
              ko&apos;ring.
            </div>
          ) : (
            <ApplyForm uni={uni} onApplied={onApplied} />
          )}
        </div>
      )}
    </div>
  );
}

function ApplyForm({
  uni,
  onApplied,
}: {
  uni: University;
  onApplied: () => void;
}) {
  const [majorId, setMajorId] = useState<string>(uni.majors[0]?.id || "");
  const major = uni.majors.find((m) => m.id === majorId) as Major | undefined;
  const [partOfDay, setPartOfDay] = useState<PartOfDay>(
    (major?.partsOfDay[0] as PartOfDay) || "kunduzgi",
  );
  const [grant, setGrant] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiJson("/api/applications", {
        body: {
          universityId: uni.id,
          majorId,
          partOfDay,
          financialAid: grant,
        },
      });
      haptic("success");
      onApplied();
    } catch (e) {
      haptic("error");
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  if (uni.majors.length === 0) {
    return (
      <div className="text-[13px] text-muted">
        Bu universitetda hozircha mutaxassisliklar kiritilmagan.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Field label="Mutaxassislik">
        <select
          value={majorId}
          onChange={(e) => {
            setMajorId(e.target.value);
            const m = uni.majors.find((x) => x.id === e.target.value);
            if (m) setPartOfDay((m.partsOfDay[0] as PartOfDay) || "kunduzgi");
          }}
          className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px]"
        >
          {uni.majors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="O'qish shakli">
        <div className="flex gap-2 flex-wrap">
          {(major?.partsOfDay || []).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPartOfDay(p as PartOfDay)}
              className={`h-9 px-3 rounded-full text-[13px] font-medium border ${
                partOfDay === p
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas text-ink border-hairline"
              }`}
            >
              {PART_OF_DAY_LABEL[p]}
            </button>
          ))}
        </div>
      </Field>

      {uni.offersFinancialAid && (
        <label className="flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={grant}
            onChange={(e) => setGrant(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          Grant / moliyaviy yordamga da&apos;vogarman
        </label>
      )}

      {error && <p className="text-[13px] text-error">{error}</p>}

      <button
        onClick={apply}
        disabled={busy || !majorId}
        className="w-full h-11 rounded-md bg-primary text-white text-[15px] font-medium disabled:opacity-60"
      >
        {busy ? "Qo'shilmoqda..." : "Arizaga qo'shish"}
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[13px] font-medium text-ink mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Info({ label, v }: { label: string; v: string }) {
  return (
    <div className="bg-surface-soft rounded-md px-3 py-2">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="text-[13px] font-medium text-ink">{v}</div>
    </div>
  );
}
