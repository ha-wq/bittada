"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isProfileComplete, useAuth, apiJson } from "@/lib/auth-context";
import { DtmScore, IeltsScore, Profile, SatScore } from "@/lib/types";
import { Button, Input, Select } from "@/components/ui";

const EMPTY_IELTS: IeltsScore = {
  overall: "",
  listening: "",
  reading: "",
  writing: "",
  speaking: "",
};

const EMPTY_SAT: SatScore = {
  total: "",
  math: "",
  readingWriting: "",
};

const DTM_MAJBURIY_DEFAULTS = [
  "Ona tili va adabiyot",
  "Matematika",
  "O'zbekiston tarixi",
];

const EMPTY_DTM: DtmScore = {
  total: "",
  majburiy: DTM_MAJBURIY_DEFAULTS.map((name) => ({ name, score: "" })),
  asosiy: [
    { name: "", score: "" },
    { name: "", score: "" },
  ],
};

const EMPTY: Profile = {
  school: null,
  photo: null,
  phone: null,
  country: "O'zbekiston",
  citizenship: "O'zbekiston",
  address: null,
  passportId: null,
  graduationYear: null,
  idCardFront: null,
  idCardBack: null,
  diploma: null,
  applyingForGrant: false,
  ielts: null,
  sat: null,
  dtm: null,
};

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.profile) setForm({ ...EMPTY, ...user.profile });
  }, [user]);

  if (loading || !user) return null;

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiJson("/api/profile", { method: "PUT", body: form });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const complete = isProfileComplete(form);
  const requiredFields = [
    form.school,
    form.phone,
    form.country,
    form.citizenship,
    form.address,
    form.passportId,
    form.graduationYear,
    form.diploma,
    form.idCardFront,
    form.idCardBack,
  ];
  const filled = requiredFields.filter(Boolean).length;
  const percent = Math.round((filled / requiredFields.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10">
      <h1 className="text-[28px] font-bold text-ink">Profil</h1>
      <p className="text-[15px] text-muted mt-2">
        Bu ma'lumotlar barcha universitetlarga ariza topshirishda ishlatiladi.
      </p>

      <div className="mt-6 mb-8 bg-surface-soft rounded-md p-4 flex items-center justify-between">
        <div>
          <div className="text-[14px] font-medium text-ink">
            Profil to'ldirilgan: {percent}%
          </div>
          <div className="w-64 h-2 bg-hairline rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${complete ? "bg-success" : "bg-primary"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        {complete && (
          <span className="text-[13px] font-semibold text-success">✓ To'liq</span>
        )}
      </div>

      <form onSubmit={submit} className="space-y-8">
        <Section title="Shaxsiy ma'lumotlar">
          <div className="space-y-4">
            <FileUploadField
              label="Profil rasmi"
              kind="image"
              accept="image/jpeg,image/png"
              acceptLabel="JPG yoki PNG"
              instructions={[
                "Oq yoki ochiq fonda olingan rasm",
                "Yuz to'g'ridan ko'rinib turishi kerak — quyoshli ko'zoynak va bosh kiyimsiz",
                "So'nggi 6 oy ichida olingan, passport uslubidagi rasm",
                "Yuzning kamida 70 foizi rasm maydonini egallashi kerak",
              ]}
              value={form.photo}
              onChange={(v) => set("photo", v)}
            />
            <Input
              label="Telefon raqami"
              name="phone"
              value={form.phone || ""}
              required
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+998 90 123 45 67"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Mamlakat"
                name="country"
                value={form.country || ""}
                required
                onChange={(e) => set("country", e.target.value)}
              />
              <Input
                label="Fuqarolik"
                name="citizenship"
                value={form.citizenship || ""}
                required
                onChange={(e) => set("citizenship", e.target.value)}
              />
            </div>
            <Input
              label="Yashash manzili"
              name="address"
              value={form.address || ""}
              required
              onChange={(e) => set("address", e.target.value)}
              placeholder="Toshkent, Chilonzor tumani, 12-mavze, 5-uy"
            />
            <Input
              label="Passport ID (AA1234567)"
              name="passportId"
              value={form.passportId || ""}
              required
              onChange={(e) => set("passportId", e.target.value.toUpperCase())}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <FileUploadField
                label="ID karta — old tomoni"
                required
                kind="image"
                accept="image/jpeg,image/png"
                acceptLabel="JPG yoki PNG"
                value={form.idCardFront}
                onChange={(v) => set("idCardFront", v)}
              />
              <FileUploadField
                label="ID karta — orqa tomoni"
                required
                kind="image"
                accept="image/jpeg,image/png"
                acceptLabel="JPG yoki PNG"
                value={form.idCardBack}
                onChange={(v) => set("idCardBack", v)}
              />
            </div>
          </div>
        </Section>

        <Section title="Ta'lim">
          <div className="space-y-4">
            <Input
              label="Maktab nomi"
              name="school"
              value={form.school || ""}
              required
              onChange={(e) => set("school", e.target.value)}
              placeholder="Toshkent, 110-maktab"
            />
            <Select
              label="Bitirgan yil"
              name="graduationYear"
              value={form.graduationYear || ""}
              onChange={(e) => set("graduationYear", e.target.value)}
              required
            >
              <option value="">Tanlang...</option>
              {Array.from({ length: 8 }, (_, i) => 2026 - i + 2).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <FileUploadField
              label="Diplom / Attestat"
              required
              accept="application/pdf,image/jpeg,image/png"
              acceptLabel="PDF, JPG yoki PNG"
              value={form.diploma}
              onChange={(v) => set("diploma", v)}
            />
          </div>
        </Section>

        <Section title="Test natijalari">
          <p className="text-[14px] text-muted -mt-2 mb-4">
            Hammasi ixtiyoriy. Sizda bor testlarni qo'shing — har biri qism-ballarini
            saqlaydi.
          </p>

          <div className="space-y-3">
            <TestBlock
              label="DTM"
              hint="O'zbekiston Davlat Test Markazi"
              active={!!form.dtm}
              onAdd={() => set("dtm", EMPTY_DTM)}
              onRemove={() => set("dtm", null)}
            >
              {form.dtm && (
                <DtmFields value={form.dtm} onChange={(v) => set("dtm", v)} />
              )}
            </TestBlock>

            <TestBlock
              label="IELTS"
              hint="Ingliz tili — Listening, Reading, Writing, Speaking"
              active={!!form.ielts}
              onAdd={() => set("ielts", EMPTY_IELTS)}
              onRemove={() => set("ielts", null)}
            >
              {form.ielts && (
                <IeltsFields
                  value={form.ielts}
                  onChange={(v) => set("ielts", v)}
                />
              )}
            </TestBlock>

            <TestBlock
              label="SAT"
              hint="Scholastic Assessment Test — Math + Reading/Writing"
              active={!!form.sat}
              onAdd={() => set("sat", EMPTY_SAT)}
              onRemove={() => set("sat", null)}
            >
              {form.sat && (
                <SatFields value={form.sat} onChange={(v) => set("sat", v)} />
              )}
            </TestBlock>
          </div>
        </Section>

        <Section title="Moliyaviy yordam">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.applyingForGrant}
              onChange={(e) => set("applyingForGrant", e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-primary"
            />
            <span>
              <span className="block text-[15px] font-medium text-ink">
                Grant / moliyaviy yordamga ariza topshirmoqchiman
              </span>
              <span className="block text-[13px] text-muted mt-0.5">
                Tegishli universitetlar bu ma'lumotni ko'rishadi.
              </span>
            </span>
          </label>
        </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold text-ink mb-4">{title}</h2>
      {children}
    </div>
  );
}

function TestBlock({
  label,
  hint,
  active,
  onAdd,
  onRemove,
  children,
}: {
  label: string;
  hint: string;
  active: boolean;
  onAdd: () => void;
  onRemove: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-hairline rounded-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="text-[15px] font-semibold text-ink">{label}</div>
          <div className="text-[13px] text-muted mt-0.5">{hint}</div>
        </div>
        {active ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-[13px] text-error font-medium hover:underline"
          >
            O'chirish
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="text-[14px] font-medium text-ink border border-hairline hover:border-ink rounded-full px-4 h-9"
          >
            + Qo'shish
          </button>
        )}
      </div>
      {active && (
        <div className="border-t border-hairline-soft p-4 bg-surface-soft/40">
          {children}
        </div>
      )}
    </div>
  );
}

function IeltsFields({
  value,
  onChange,
}: {
  value: IeltsScore;
  onChange: (v: IeltsScore) => void;
}) {
  const set = <K extends keyof IeltsScore>(k: K, v: IeltsScore[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <Input
          label="Overall"
          value={value.overall}
          onChange={(e) => set("overall", e.target.value)}
          placeholder="6.5"
        />
        <Input
          label="Listening"
          value={value.listening}
          onChange={(e) => set("listening", e.target.value)}
          placeholder="6.5"
        />
        <Input
          label="Reading"
          value={value.reading}
          onChange={(e) => set("reading", e.target.value)}
          placeholder="6.5"
        />
        <Input
          label="Writing"
          value={value.writing}
          onChange={(e) => set("writing", e.target.value)}
          placeholder="6.0"
        />
        <Input
          label="Speaking"
          value={value.speaking}
          onChange={(e) => set("speaking", e.target.value)}
          placeholder="7.0"
        />
      </div>
      <FileUploadField
        label="IELTS sertifikati"
        accept="application/pdf,image/jpeg,image/png"
        acceptLabel="PDF, JPG yoki PNG"
        value={value.certificate || null}
        onChange={(v) => set("certificate", v || undefined)}
      />
    </div>
  );
}

function SatFields({
  value,
  onChange,
}: {
  value: SatScore;
  onChange: (v: SatScore) => void;
}) {
  const set = <K extends keyof SatScore>(k: K, v: SatScore[K]) =>
    onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <Input
          label="Umumiy ball"
          value={value.total}
          onChange={(e) => set("total", e.target.value)}
          placeholder="1340"
        />
        <Input
          label="Math"
          value={value.math}
          onChange={(e) => set("math", e.target.value)}
          placeholder="680"
        />
        <Input
          label="Reading & Writing"
          value={value.readingWriting}
          onChange={(e) => set("readingWriting", e.target.value)}
          placeholder="660"
        />
      </div>
      <FileUploadField
        label="SAT score report"
        accept="application/pdf,image/jpeg,image/png"
        acceptLabel="PDF, JPG yoki PNG"
        value={value.certificate || null}
        onChange={(v) => set("certificate", v || undefined)}
      />
    </div>
  );
}

function DtmFields({
  value,
  onChange,
}: {
  value: DtmScore;
  onChange: (v: DtmScore) => void;
}) {
  const setMaj = (i: number, patch: Partial<{ name: string; score: string }>) => {
    const next = value.majburiy.map((s, idx) =>
      idx === i ? { ...s, ...patch } : s,
    );
    onChange({ ...value, majburiy: next });
  };
  const setAso = (i: number, patch: Partial<{ name: string; score: string }>) => {
    const next = value.asosiy.map((s, idx) =>
      idx === i ? { ...s, ...patch } : s,
    );
    onChange({ ...value, asosiy: next });
  };

  return (
    <div className="space-y-5">
      <Input
        label="Umumiy ball"
        value={value.total}
        onChange={(e) => onChange({ ...value, total: e.target.value })}
        placeholder="189.7"
      />

      <div>
        <div className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-2">
          Majburiy fanlar
        </div>
        <div className="space-y-2">
          {value.majburiy.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px] gap-2">
              <Input
                value={s.name}
                onChange={(e) => setMaj(i, { name: e.target.value })}
                placeholder="Fan nomi"
              />
              <Input
                value={s.score}
                onChange={(e) => setMaj(i, { score: e.target.value })}
                placeholder="Ball"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[13px] font-semibold uppercase tracking-wide text-muted mb-2">
          Asosiy fanlar
        </div>
        <div className="space-y-2">
          {value.asosiy.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px] gap-2">
              <Input
                value={s.name}
                onChange={(e) => setAso(i, { name: e.target.value })}
                placeholder="Fan nomi"
              />
              <Input
                value={s.score}
                onChange={(e) => setAso(i, { score: e.target.value })}
                placeholder="Ball"
              />
            </div>
          ))}
        </div>
      </div>

      <FileUploadField
        label="DTM sertifikati"
        accept="application/pdf,image/jpeg,image/png"
        acceptLabel="PDF, JPG yoki PNG"
        value={value.certificate || null}
        onChange={(v) => onChange({ ...value, certificate: v || undefined })}
      />
    </div>
  );
}

function FileUploadField({
  label,
  value,
  onChange,
  required,
  accept,
  acceptLabel,
  instructions,
  kind = "doc",
  maxSizeMb = 2,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string | null) => void;
  required?: boolean;
  accept?: string;
  acceptLabel?: string;
  instructions?: string[];
  kind?: "doc" | "image";
  maxSizeMb?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Fayl hajmi ${maxSizeMb}MB dan oshmasligi kerak.`);
      return;
    }
    if (accept) {
      const allowed = accept.split(",").map((s) => s.trim());
      if (!allowed.includes(file.type)) {
        setError(`Faqat ${acceptLabel || accept} formatdagi fayllar qabul qilinadi.`);
        return;
      }
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Yuklashda xatolik");
      onChange(data.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="block text-[14px] font-medium text-ink">
          {label} {required && <span className="text-error">*</span>}
        </div>
        <div className="text-[12px] text-muted">
          {acceptLabel ? `${acceptLabel} · ` : ""}max {maxSizeMb}MB
        </div>
      </div>

      {instructions && instructions.length > 0 && (
        <ul className="mb-2 space-y-0.5 text-[13px] text-muted list-disc list-inside">
          {instructions.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {value ? (
        <div className="flex items-center justify-between border border-hairline rounded-md px-4 py-3">
          <a
            href={`/api/files/${value}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-[14px] text-ink min-w-0 hover:underline"
          >
            <span>📄</span>
            <span className="truncate">{value}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange(null);
            }}
            className="text-[13px] text-error font-medium hover:underline flex-shrink-0 ml-3"
          >
            O'chirish
          </button>
        </div>
      ) : (
        <label
          className={`flex items-center justify-center border border-dashed border-hairline rounded-md py-6 cursor-pointer hover:border-ink hover:bg-surface-soft transition-colors ${
            uploading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <span className="text-[14px] text-muted">
            {uploading ? "Yuklanmoqda..." : "+ Fayl yuklash uchun bosing"}
          </span>
        </label>
      )}

      {error && <p className="text-[13px] text-error mt-1.5">{error}</p>}
    </div>
  );
}
