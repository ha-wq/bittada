"use client";

import { useState } from "react";
import { apiJson } from "@/lib/auth-context";
import { Profile } from "@/lib/types";

const ALL_PARTS = [
  { v: "kunduzgi", l: "Kunduzgi" },
  { v: "kechki", l: "Kechki" },
  { v: "sirtqi", l: "Sirtqi" },
];
const ALL_LANGS = ["O'zbek", "Rus", "Ingliz"];

type Summary = { created: number; submitted: number; needExam: number };

export function ScoutingCard({
  profile,
  complete,
  onChanged,
}: {
  profile: Profile | null | undefined;
  complete: boolean;
  onChanged?: () => void;
}) {
  const [cities, setCities] = useState((profile?.scoutCities || []).join(", "));
  const [keywords, setKeywords] = useState(
    (profile?.scoutKeywords || []).join(", "),
  );
  const [parts, setParts] = useState<string[]>(profile?.scoutPartsOfDay || []);
  const [langs, setLangs] = useState<string[]>(profile?.scoutLanguages || []);
  const [willingTest, setWillingTest] = useState(
    profile?.scoutWillingTest ?? false,
  );
  const [tuition, setTuition] = useState(
    profile?.scoutTuitionMax ? String(profile.scoutTuitionMax) : "",
  );
  const [enabled, setEnabled] = useState(profile?.scoutingEnabled ?? false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const csv = (s: string) =>
    s.split(",").map((x) => x.trim()).filter(Boolean);

  const save = async (turnOn: boolean) => {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const res = await apiJson<{ summary: Summary | null }>("/api/scouting", {
        method: "PUT",
        body: {
          scoutingEnabled: turnOn,
          scoutCities: csv(cities),
          scoutKeywords: csv(keywords),
          scoutPartsOfDay: parts,
          scoutLanguages: langs,
          scoutWillingTest: willingTest,
          scoutTuitionMax: tuition ? Number(tuition) : null,
        },
      });
      setEnabled(turnOn);
      if (res.summary) setSummary(res.summary);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-hairline rounded-md p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-ink">
          Skauting — avtomatik ariza
        </h2>
        <span
          className={`text-[12px] font-semibold px-2 py-1 rounded-full ${
            enabled ? "bg-success/10 text-success" : "bg-surface-strong text-muted"
          }`}
        >
          {enabled ? "Yoqilgan" : "O'chiq"}
        </span>
      </div>
      <p className="text-[13px] text-muted mt-1">
        Filtrlaringizga mos universitetlarga arizalar avtomatik yuboriladi.
      </p>

      {!complete && (
        <div className="mt-3 text-[13px] bg-warning/10 text-warning rounded-md p-3">
          Skautingni yoqishdan oldin profilni to&apos;liq to&apos;ldiring
          (hujjatlar, passport va h.k.).
        </div>
      )}

      <div className="mt-4 space-y-4">
        <Field label="Shaharlar (vergul bilan)">
          <input
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="Toshkent, Samarqand"
            className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px]"
          />
        </Field>
        <Field label="Mutaxassislik kalit so'zlari (vergul bilan)">
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Kompyuter, Iqtisod, Huquq"
            className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px]"
          />
        </Field>

        <Field label="O'qish shakli">
          <Chips
            options={ALL_PARTS}
            selected={parts}
            onToggle={(v) => toggle(parts, v, setParts)}
          />
        </Field>
        <Field label="Ta'lim tili">
          <Chips
            options={ALL_LANGS.map((l) => ({ v: l, l }))}
            selected={langs}
            onToggle={(v) => toggle(langs, v, setLangs)}
          />
        </Field>

        <Field label="Maksimal o'qish narxi (so'm/yil, ixtiyoriy)">
          <input
            type="number"
            value={tuition}
            onChange={(e) => setTuition(e.target.value)}
            placeholder="30000000"
            className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px]"
          />
        </Field>

        <label className="flex items-center gap-2.5 text-[14px] text-ink">
          <input
            type="checkbox"
            checked={willingTest}
            onChange={(e) => setWillingTest(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          Ichki imtihon topshirishga tayyorman
        </label>
      </div>

      {error && <p className="text-[13px] text-error mt-3">{error}</p>}
      {summary && (
        <div className="mt-3 text-[13px] bg-success/10 text-success rounded-md p-3">
          {summary.created} ta ariza yaratildi, {summary.submitted} tasi
          yuborildi
          {summary.needExam > 0
            ? `, ${summary.needExam} tasi imtihon talab qiladi`
            : ""}
          .
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {enabled ? (
          <>
            <button
              onClick={() => save(true)}
              disabled={busy || !complete}
              className="h-11 px-4 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
            >
              {busy ? "Saqlanmoqda..." : "Saqlash va qayta skanerlash"}
            </button>
            <button
              onClick={() => save(false)}
              disabled={busy}
              className="h-11 px-4 rounded-md border border-hairline text-[14px] font-medium text-ink"
            >
              O&apos;chirish
            </button>
          </>
        ) : (
          <button
            onClick={() => save(true)}
            disabled={busy || !complete}
            className="h-11 px-4 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
          >
            {busy ? "Yoqilmoqda..." : "Skautingni yoqish"}
          </button>
        )}
      </div>
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

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: { v: string; l: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((o) => {
        const active = selected.includes(o.v);
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onToggle(o.v)}
            className={`h-9 px-3 rounded-full text-[13px] font-medium border ${
              active
                ? "bg-ink text-white border-ink"
                : "bg-canvas text-ink border-hairline hover:border-ink"
            }`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
