"use client";

import { useState } from "react";
import { apiJson, isProfileComplete, useAuth } from "@/lib/auth-context";
import { Profile } from "@/lib/types";
import { haptic } from "@/lib/telegram-webapp";
import { ScoutingCard } from "@/components/ScoutingCard";
import { ClaimCodeCard } from "@/components/ClaimCodeCard";

const CURRENT_YEAR = new Date().getUTCFullYear();
const GRAD_YEARS = Array.from({ length: 8 }, (_, i) => String(CURRENT_YEAR + 1 - i));

type FormState = {
  school: string;
  phone: string;
  country: string;
  citizenship: string;
  address: string;
  passportId: string;
  graduationYear: string;
  photo: string | null;
  idCardFront: string | null;
  idCardBack: string | null;
  diploma: string | null;
  ieltsOverall: string;
  dtmTotal: string;
  satTotal: string;
};

function initForm(p?: Profile | null): FormState {
  return {
    school: p?.school || "",
    phone: p?.phone || "",
    country: p?.country || "",
    citizenship: p?.citizenship || "",
    address: p?.address || "",
    passportId: p?.passportId || "",
    graduationYear: p?.graduationYear || "",
    photo: p?.photo || null,
    idCardFront: p?.idCardFront || null,
    idCardBack: p?.idCardBack || null,
    diploma: p?.diploma || null,
    ieltsOverall: p?.ielts?.overall || "",
    dtmTotal: p?.dtm?.total || "",
    satTotal: p?.sat?.total || "",
  };
}

export default function TgProfile() {
  const { user, refresh, signOut } = useAuth();
  const [form, setForm] = useState<FormState>(() => initForm(user?.profile));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const complete = isProfileComplete(user?.profile);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const prev = user?.profile;
      await apiJson("/api/profile", {
        method: "PUT",
        body: {
          school: form.school,
          phone: form.phone,
          country: form.country,
          citizenship: form.citizenship,
          address: form.address,
          passportId: form.passportId,
          graduationYear: form.graduationYear,
          photo: form.photo,
          idCardFront: form.idCardFront,
          idCardBack: form.idCardBack,
          diploma: form.diploma,
          applyingForGrant: prev?.applyingForGrant ?? false,
          milliySertifikat: prev?.milliySertifikat ?? null,
          ielts: form.ieltsOverall
            ? { ...(prev?.ielts || {}), overall: form.ieltsOverall }
            : null,
          dtm: form.dtmTotal
            ? { ...(prev?.dtm || {}), total: form.dtmTotal }
            : null,
          sat: form.satTotal
            ? { ...(prev?.sat || {}), total: form.satTotal }
            : null,
        },
      });
      haptic("success");
      setSaved(true);
      await refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch {
      haptic("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-ink">Profil</h1>
        <button
          onClick={signOut}
          className="text-[13px] text-error font-medium"
        >
          Chiqish
        </button>
      </div>
      <div className="text-[14px] text-ink mt-1 mb-1">{user?.fullName}</div>
      <div
        className={`inline-flex items-center gap-1.5 text-[12px] font-medium mb-4 ${
          complete ? "text-success" : "text-warning"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${complete ? "bg-success" : "bg-warning"}`}
        />
        {complete ? "Profil to'ldirilgan" : "Profil to'liq emas"}
      </div>

      <Section title="Shaxsiy ma'lumotlar">
        <Text label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} />
        <Text label="Maktab" value={form.school} onChange={(v) => set("school", v)} />
        <Text label="Davlat" value={form.country} onChange={(v) => set("country", v)} />
        <Text
          label="Fuqarolik"
          value={form.citizenship}
          onChange={(v) => set("citizenship", v)}
        />
        <Text label="Manzil" value={form.address} onChange={(v) => set("address", v)} />
        <Text
          label="Passport ID"
          value={form.passportId}
          onChange={(v) => set("passportId", v)}
        />
        <div>
          <Label>Bitirgan yili</Label>
          <select
            value={form.graduationYear}
            onChange={(e) => set("graduationYear", e.target.value)}
            className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px]"
          >
            <option value="">Tanlang</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Test natijalari (ixtiyoriy)">
        <Text
          label="IELTS (umumiy)"
          value={form.ieltsOverall}
          onChange={(v) => set("ieltsOverall", v)}
        />
        <Text
          label="DTM (umumiy ball)"
          value={form.dtmTotal}
          onChange={(v) => set("dtmTotal", v)}
        />
        <Text
          label="SAT (umumiy)"
          value={form.satTotal}
          onChange={(v) => set("satTotal", v)}
        />
      </Section>

      <Section title="Hujjatlar">
        <FileUpload
          label="Rasm (JPG/PNG)"
          kind="image"
          accept="image/jpeg,image/png"
          value={form.photo}
          onChange={(v) => set("photo", v)}
        />
        <FileUpload
          label="ID karta (old)"
          kind="image"
          accept="image/jpeg,image/png"
          value={form.idCardFront}
          onChange={(v) => set("idCardFront", v)}
        />
        <FileUpload
          label="ID karta (orqa)"
          kind="image"
          accept="image/jpeg,image/png"
          value={form.idCardBack}
          onChange={(v) => set("idCardBack", v)}
        />
        <FileUpload
          label="Diplom / attestat (PDF/JPG/PNG)"
          kind="doc"
          accept="image/jpeg,image/png,application/pdf"
          value={form.diploma}
          onChange={(v) => set("diploma", v)}
        />
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full h-12 rounded-md bg-primary text-white text-[15px] font-medium mt-2 disabled:opacity-60"
      >
        {saving ? "Saqlanmoqda..." : saved ? "✓ Saqlandi" : "Saqlash"}
      </button>

      <div className="mt-6 space-y-5">
        <ScoutingCard
          profile={user?.profile}
          complete={isProfileComplete(user?.profile)}
          onChanged={refresh}
        />
        <ClaimCodeCard />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-[13px] font-semibold text-ink mb-2.5">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-medium text-ink mb-1.5">{children}</div>;
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px] focus:border-ink outline-none"
      />
    </div>
  );
}

function FileUpload({
  label,
  value,
  onChange,
  kind,
  accept,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  kind: "image" | "doc";
  accept: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > 2 * 1024 * 1024) {
      setError("Fayl 2MB dan oshmasligi kerak.");
      return;
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
      <Label>{label}</Label>
      {value ? (
        <div className="flex items-center justify-between border border-hairline rounded-md px-3 py-2.5">
          <a
            href={`/api/files/${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-ink truncate flex items-center gap-2"
          >
            <span>📄</span>
            <span className="truncate">Yuklandi</span>
          </a>
          <button
            onClick={() => onChange(null)}
            className="text-[13px] text-error font-medium ml-3 flex-shrink-0"
          >
            O&apos;chirish
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center border border-dashed border-hairline rounded-md py-4 text-[13px] text-muted">
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => handle(e.target.files?.[0])}
          />
          {uploading ? "Yuklanmoqda..." : "+ Fayl yuklash"}
        </label>
      )}
      {error && <p className="text-[12px] text-error mt-1">{error}</p>}
    </div>
  );
}
