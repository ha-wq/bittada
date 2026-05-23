"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isProfileComplete, useAuth } from "@/lib/auth-context";
import { Profile } from "@/lib/types";
import { Button, Input, Select } from "@/components/ui";

const EMPTY: Profile = {
  school: "",
  phone: "",
  country: "O'zbekiston",
  citizenship: "O'zbekiston",
  address: "",
  passportId: "",
  graduationYear: "",
  ielts: "",
  sat: "",
  dtm: "",
  applyingForGrant: false,
  diplomaUploaded: false,
  dtmUploaded: false,
};

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.profile) setForm(user.profile);
  }, [user]);

  if (loading || !user) return null;

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
    form.diplomaUploaded ? "x" : "",
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
          <span className="text-[13px] font-semibold text-success">
            ✓ To'liq
          </span>
        )}
      </div>

      <form onSubmit={submit} className="space-y-8">
        <Section title="Shaxsiy ma'lumotlar">
          <div className="space-y-4">
            <FileUploadField
              label="Profil rasmi"
              value={form.photo}
              onChange={(v) => set("photo", v)}
            />
            <Input
              label="Telefon raqami"
              name="phone"
              value={form.phone}
              required
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+998 90 123 45 67"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Mamlakat"
                name="country"
                value={form.country}
                required
                onChange={(e) => set("country", e.target.value)}
              />
              <Input
                label="Fuqarolik"
                name="citizenship"
                value={form.citizenship}
                required
                onChange={(e) => set("citizenship", e.target.value)}
              />
            </div>
            <Input
              label="Yashash manzili"
              name="address"
              value={form.address}
              required
              onChange={(e) => set("address", e.target.value)}
              placeholder="Toshkent, Chilonzor tumani, 12-mavze, 5-uy"
            />
            <Input
              label="Passport ID (AA1234567)"
              name="passportId"
              value={form.passportId}
              required
              onChange={(e) => set("passportId", e.target.value.toUpperCase())}
            />
          </div>
        </Section>

        <Section title="Ta'lim">
          <div className="space-y-4">
            <Input
              label="Maktab nomi"
              name="school"
              value={form.school}
              required
              onChange={(e) => set("school", e.target.value)}
              placeholder="Toshkent, 110-maktab"
            />
            <Select
              label="Bitirgan yil"
              name="graduationYear"
              value={form.graduationYear}
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
              label="Diplom / Attestat (PDF, JPG)"
              required
              value={form.diplomaUploaded ? "diplom.pdf" : undefined}
              onChange={(v) => set("diplomaUploaded", !!v)}
            />
          </div>
        </Section>

        <Section title="Test natijalari">
          <p className="text-[14px] text-muted -mt-2 mb-4">
            Mavjud bo'lganlarini kiriting. Talab qilingan paytda yuklash mumkin.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="DTM ball"
              name="dtm"
              value={form.dtm}
              onChange={(e) => set("dtm", e.target.value)}
              placeholder="189"
            />
            <Input
              label="IELTS"
              name="ielts"
              value={form.ielts}
              onChange={(e) => set("ielts", e.target.value)}
              placeholder="6.5"
            />
            <Input
              label="SAT"
              name="sat"
              value={form.sat}
              onChange={(e) => set("sat", e.target.value)}
              placeholder="1340"
            />
          </div>
          <div className="mt-4">
            <FileUploadField
              label="DTM sertifikati (ixtiyoriy)"
              value={form.dtmUploaded ? "dtm.pdf" : undefined}
              onChange={(v) => set("dtmUploaded", !!v)}
            />
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
          <Button type="submit">Saqlash</Button>
          {saved && (
            <span className="text-[14px] text-success font-medium">
              ✓ Saqlandi
            </span>
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

function FileUploadField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  required?: boolean;
}) {
  return (
    <div>
      <div className="block text-[14px] font-medium text-ink mb-1.5">
        {label} {required && <span className="text-error">*</span>}
      </div>
      {value ? (
        <div className="flex items-center justify-between border border-hairline rounded-md px-4 py-3">
          <div className="flex items-center gap-2 text-[14px] text-ink">
            <span>📄</span>
            <span>{value}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[13px] text-error font-medium hover:underline"
          >
            O'chirish
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center border border-dashed border-hairline rounded-md py-6 cursor-pointer hover:border-ink hover:bg-surface-soft transition-colors">
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onChange(f.name);
            }}
          />
          <span className="text-[14px] text-muted">
            + Fayl yuklash uchun bosing
          </span>
        </label>
      )}
    </div>
  );
}
