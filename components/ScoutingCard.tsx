"use client";

import { useState } from "react";
import { apiJson } from "@/lib/auth-context";
import { Profile } from "@/lib/types";

const ALL_PARTS = [
  { value: "kunduzgi", label: "Kunduzgi" },
  { value: "kechki", label: "Kechki" },
  { value: "sirtqi", label: "Sirtqi" },
];
const ALL_LANGS = [
  { value: "O'zbek", label: "O'zbek" },
  { value: "Rus", label: "Rus" },
  { value: "Ingliz", label: "Ingliz" },
];
const ALL_CITIES = [
  "Toshkent", "Samarqand", "Buxoro", "Namangan",
  "Andijon", "Farg'ona", "Qo'qon", "Nukus",
  "Termiz", "Qarshi", "Urganch", "Navoiy",
];
const ALL_MAJORS = [
  "Kompyuter fanlari", "Iqtisodiyot", "Huquq", "Tibbiyot",
  "Muhandislik", "Arxitektura", "Pedagogika", "Menejment",
  "Moliya", "Psixologiya", "Matematika", "Jurnalistika",
  "Xalqaro munosabatlar", "Dizayn",
];

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
  const [cities, setCities] = useState<string[]>(profile?.scoutCities || []);
  const [majors, setMajors] = useState<string[]>(profile?.scoutKeywords || []);
  const [parts, setParts] = useState<string[]>(profile?.scoutPartsOfDay || []);
  const [langs, setLangs] = useState<string[]>(profile?.scoutLanguages || []);
  const [willingTest, setWillingTest] = useState(profile?.scoutWillingTest ?? false);
  const [tuition, setTuition] = useState(
    profile?.scoutTuitionMax ? String(profile.scoutTuitionMax) : "",
  );
  const [enabled, setEnabled] = useState(profile?.scoutingEnabled ?? false);
  // Form panel open when already enabled (so user can see/edit), else collapsed
  const [open, setOpen] = useState(profile?.scoutingEnabled ?? false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tog = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const save = async (turnOn: boolean) => {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const res = await apiJson<{ summary: Summary | null }>("/api/scouting", {
        method: "PUT",
        body: {
          scoutingEnabled: turnOn,
          scoutCities: cities,
          scoutKeywords: majors,
          scoutPartsOfDay: parts,
          scoutLanguages: langs,
          scoutWillingTest: willingTest,
          scoutTuitionMax: tuition ? Number(tuition) : null,
        },
      });
      setEnabled(turnOn);
      if (!turnOn) setOpen(false);
      if (res.summary) setSummary(res.summary);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  // Clicking the toggle:
  //  - enabled        → turn scouting off (also collapses)
  //  - configuring    → cancel / collapse
  //  - collapsed off  → open panel to configure
  const handleSwitchClick = () => {
    if (enabled) {
      save(false);
    } else if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  // The switch shows "active" (green) while the panel is open OR already enabled,
  // so clicking it gives immediate feedback even before you hit "Yoqish".
  const active = enabled || open;

  return (
    <div className="border border-hairline rounded-xl overflow-hidden">
      {/* ── Header (always visible) ─────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 p-5 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-ink">
            Skauting — avtomatik ariza
          </h2>
          <p className="text-[13px] text-muted mt-0.5">
            {enabled
              ? `${cities.length || "Barcha"} shahar · ${majors.length || "Barcha"} yo'nalish`
              : "Filtrlaringizga mos universitetlarga arizalar avtomatik yuboriladi."}
          </p>
        </div>

        {/* iOS-style toggle switch */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSwitchClick(); }}
          disabled={busy}
          title={active ? "Yopish" : "Sozlash"}
          className={`relative inline-flex flex-shrink-0 items-center w-[52px] h-7 rounded-full transition-colors duration-200 focus:outline-none ${
            active ? "bg-primary" : "bg-ink/15"
          } disabled:opacity-40`}
        >
          <span
            className={`inline-block w-[22px] h-[22px] rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
              active ? "translate-x-[27px]" : "translate-x-[3px]"
            }`}
          />
        </button>
      </div>

      {/* ── Expandable settings panel ─────────────────────────── */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
      <div className="overflow-hidden">
        <div className="border-t border-hairline px-5 pt-4 pb-5 space-y-5 bg-surface-soft/30">
          {!complete && (
            <div className="text-[13px] bg-warning/10 text-warning rounded-lg p-3 leading-relaxed">
              Skautingni yoqishdan oldin profilni to&apos;liq to&apos;ldiring
              (hujjatlar, passport va h.k.).
            </div>
          )}

          <Field label="Shaharlar">
            <ChipSelect
              options={ALL_CITIES}
              selected={cities}
              onToggle={(v) => tog(cities, v, setCities)}
            />
          </Field>

          <Field label="Mutaxassisliklar">
            <ChipSelect
              options={ALL_MAJORS}
              selected={majors}
              onToggle={(v) => tog(majors, v, setMajors)}
            />
          </Field>

          <Field label="O'qish shakli">
            <ChipSelect
              options={ALL_PARTS}
              selected={parts}
              onToggle={(v) => tog(parts, v, setParts)}
            />
          </Field>

          <Field label="Ta'lim tili">
            <ChipSelect
              options={ALL_LANGS}
              selected={langs}
              onToggle={(v) => tog(langs, v, setLangs)}
            />
          </Field>

          <Field label="Maksimal o'qish narxi (so'm/yil, ixtiyoriy)">
            <input
              type="number"
              value={tuition}
              onChange={(e) => setTuition(e.target.value)}
              placeholder="30 000 000"
              className="w-full h-11 px-3 rounded-md border border-ink/20 bg-canvas text-[14px] focus:outline-none focus:border-ink focus:border-2 transition-colors"
            />
          </Field>

          <label className="flex items-center gap-2.5 text-[14px] text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={willingTest}
              onChange={(e) => setWillingTest(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            Ichki imtihon topshirishga tayyorman
          </label>

          {error && <p className="text-[13px] text-error">{error}</p>}
          {summary && (
            <div className="text-[13px] bg-success/10 text-success rounded-lg p-3">
              {summary.created} ta ariza yaratildi, {summary.submitted} tasi
              yuborildi
              {summary.needExam > 0
                ? `, ${summary.needExam} tasi imtihon talab qiladi`
                : ""}
              .
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {enabled ? (
              <>
                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={busy || !complete}
                  className="h-10 px-5 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
                >
                  {busy ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={busy}
                  className="h-10 px-4 rounded-md border border-ink/20 text-[14px] font-medium text-ink hover:border-ink"
                >
                  O&apos;chirish
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={busy || !complete}
                  className="h-10 px-5 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
                >
                  {busy ? "Yoqilmoqda..." : "Skautingni yoqish"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 px-4 rounded-md border border-ink/20 text-[14px] font-medium text-ink hover:border-ink"
                >
                  Yopish
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-ink mb-2">{label}</div>
      {children}
    </div>
  );
}

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[] | { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const normalized = (options as Array<string | { value: string; label: string }>).map(
    (o) => (typeof o === "string" ? { value: o, label: o } : o),
  );
  return (
    <div className="flex flex-wrap gap-2">
      {normalized.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`h-9 px-3.5 rounded-full text-[13px] font-medium border transition-colors ${
              active
                ? "bg-ink text-white border-ink"
                : "bg-canvas text-ink border-ink/25 hover:border-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
