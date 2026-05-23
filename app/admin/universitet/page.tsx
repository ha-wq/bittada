"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/auth-context";
import { Major, PartOfDay, University } from "@/lib/types";
import { Button, Input, Select, Textarea } from "@/components/ui";

const ALL_PARTS: PartOfDay[] = ["kunduzgi", "kechki", "sirtqi"];
const ALL_LANGS = ["O'zbek", "Rus", "Ingliz"];

type FormUni = Omit<University, "id" | "slug" | "logo" | "majors" | "deadline"> & {
  deadline: string;
  majors: Major[];
};

export default function AdminUniversityPage() {
  const [uni, setUni] = useState<FormUni | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<University>("/api/admin/university").then((u) =>
      setUni({
        ...u,
        deadline: new Date(u.deadline).toISOString().slice(0, 10),
      } as unknown as FormUni),
    );
  }, []);

  if (!uni) {
    return <div className="mx-auto max-w-3xl px-8 py-16 text-muted">Yuklanmoqda...</div>;
  }

  const set = <K extends keyof FormUni>(k: K, v: FormUni[K]) =>
    setUni((p) => (p ? { ...p, [k]: v } : p));

  const toggleLang = (lang: string) => {
    const has = uni.language.includes(lang);
    set("language", has ? uni.language.filter((l) => l !== lang) : [...uni.language, lang]);
  };

  const setMajor = (i: number, patch: Partial<Major>) => {
    const next = uni.majors.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    set("majors", next);
  };

  const addMajor = () =>
    set("majors", [
      ...uni.majors,
      { id: `tmp-${Date.now()}`, name: "", partsOfDay: ["kunduzgi"] },
    ]);

  const removeMajor = (i: number) =>
    set("majors", uni.majors.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiJson("/api/admin/university", { method: "PUT", body: uni });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-bold text-ink">Universitet sahifasi</h1>
      <p className="text-[15px] text-muted mt-2">
        Bu yerda kiritilgan ma'lumotlar talabalarga ko'rinadi.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <Input
          label="To'liq nom"
          value={uni.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
        <Input
          label="Qisqartma"
          value={uni.shortName}
          onChange={(e) => set("shortName", e.target.value)}
          required
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Shahar"
            value={uni.city}
            onChange={(e) => set("city", e.target.value)}
            required
          />
          <Input
            label="Topshirish muddati"
            type="date"
            value={uni.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            required
          />
        </div>

        <Input
          label="Manzil"
          value={uni.address}
          onChange={(e) => set("address", e.target.value)}
          required
        />

        <Textarea
          label="Tavsif"
          value={uni.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="O'qish narxi (min, so'm)"
            type="number"
            value={uni.tuitionMin}
            onChange={(e) => set("tuitionMin", Number(e.target.value))}
            required
          />
          <Input
            label="O'qish narxi (max, so'm)"
            type="number"
            value={uni.tuitionMax}
            onChange={(e) => set("tuitionMax", Number(e.target.value))}
            required
          />
        </div>

        <div>
          <div className="text-[14px] font-medium text-ink mb-2">Ta'lim tili</div>
          <div className="flex gap-2 flex-wrap">
            {ALL_LANGS.map((l) => {
              const active = uni.language.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLang(l)}
                  className={`h-10 px-4 rounded-full text-[14px] font-medium border ${
                    active
                      ? "bg-ink text-white border-ink"
                      : "bg-canvas text-ink border-hairline hover:border-ink"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <CheckboxRow
            label="Grant / moliyaviy yordam mavjud"
            checked={uni.offersFinancialAid}
            onChange={(v) => set("offersFinancialAid", v)}
          />
          <CheckboxRow
            label="Ichki imtihon mavjud"
            checked={uni.hasEntranceExam}
            onChange={(v) => set("hasEntranceExam", v)}
          />
        </div>

        <fieldset className="border border-hairline rounded-md p-4">
          <legend className="px-2 text-[14px] font-semibold text-ink">
            Minimal talablar
          </legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="DTM (minimum ball)"
              type="number"
              value={uni.minDtm ?? ""}
              onChange={(e) =>
                set("minDtm", e.target.value ? Number(e.target.value) : null)
              }
            />
            <Input
              label="IELTS (minimum)"
              type="number"
              step="0.5"
              value={uni.minIelts ?? ""}
              onChange={(e) =>
                set("minIelts", e.target.value ? Number(e.target.value) : null)
              }
            />
            <Input
              label="SAT (minimum)"
              type="number"
              value={uni.minSat ?? ""}
              onChange={(e) =>
                set("minSat", e.target.value ? Number(e.target.value) : null)
              }
            />
            <Input
              label="GPA (minimum)"
              type="number"
              step="0.1"
              value={uni.minGpa ?? ""}
              onChange={(e) =>
                set("minGpa", e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>
          <div className="mt-4">
            <Input
              label="Qo'shimcha izoh"
              value={uni.requirementsNote ?? ""}
              onChange={(e) => set("requirementsNote", e.target.value)}
            />
          </div>
        </fieldset>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[18px] font-semibold text-ink">Mutaxassisliklar</div>
            <button
              type="button"
              onClick={addMajor}
              className="text-[14px] font-medium text-ink border border-hairline hover:border-ink rounded-full px-4 h-9"
            >
              + Qo'shish
            </button>
          </div>
          <div className="space-y-3">
            {uni.majors.map((m, i) => (
              <div key={m.id} className="border border-hairline rounded-md p-4 space-y-3">
                <Input
                  label={`Mutaxassislik ${i + 1}`}
                  value={m.name}
                  onChange={(e) => setMajor(i, { name: e.target.value })}
                />
                <div>
                  <div className="text-[13px] font-medium text-muted mb-1.5">
                    O'qish shakli
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {ALL_PARTS.map((p) => {
                      const active = m.partsOfDay.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? m.partsOfDay.filter((x) => x !== p)
                              : [...m.partsOfDay, p];
                            setMajor(i, { partsOfDay: next });
                          }}
                          className={`h-9 px-3 rounded-full text-[13px] font-medium border ${
                            active
                              ? "bg-ink text-white border-ink"
                              : "bg-canvas text-ink border-hairline hover:border-ink"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMajor(i)}
                  className="text-[13px] text-error font-medium hover:underline"
                >
                  Mutaxassislikni o'chirish
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-[14px] text-error">{error}</p>}

        <div className="flex items-center gap-4 pt-4 border-t border-hairline">
          <Button type="submit" disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          {saved && (
            <span className="text-[14px] text-success font-medium">✓ Saqlandi</span>
          )}
        </div>
      </form>
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer border border-hairline rounded-md p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-primary"
      />
      <span className="text-[14px] text-ink font-medium">{label}</span>
    </label>
  );
}
