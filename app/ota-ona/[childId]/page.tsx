"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/auth-context";
import { Application, Major, PartOfDay, Profile, University } from "@/lib/types";
import {
  APPLICATION_STATUS_LABEL,
  formatDate,
  PART_OF_DAY_LABEL,
} from "@/lib/format";
import { isProfileComplete } from "@/lib/profile";

type ChildData = {
  child: { id: string; fullName: string; email: string | null };
  profile: Profile | null;
  applications: Application[];
};

export default function ChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = use(params);
  const [data, setData] = useState<ChildData | null>(null);
  const [tab, setTab] = useState<"profil" | "arizalar">("profil");

  const load = () =>
    apiJson<ChildData>(`/api/parent/children/${childId}`).then(setData);

  useEffect(() => {
    load().catch(() => {});
  }, [childId]);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-8 py-16 text-muted">
        Yuklanmoqda...
      </div>
    );
  }

  const complete = isProfileComplete(data.profile);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10">
      <Link href="/ota-ona" className="text-[14px] text-muted">
        ← Farzandlarim
      </Link>

      <div className="mt-3 flex items-start gap-3 rounded-xl border border-primary/25 border-l-4 border-l-primary bg-primary/[0.04] px-4 py-3">
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary text-white px-1.5 py-0.5 rounded">
          Ota-ona
        </span>
        <p className="text-[14px] text-ink">
          Siz <span className="font-semibold">{data.child.fullName}</span> nomidan
          ariza topshirayapsiz. Bu yerda kiritilgan ma&apos;lumotlar farzandingiz
          profiliga saqlanadi.
        </p>
      </div>

      <h1 className="text-[26px] font-bold text-ink mt-4">
        {data.child.fullName}
      </h1>
      <div
        className={`inline-flex items-center gap-1.5 text-[12px] font-medium mt-1 ${
          complete ? "text-success" : "text-warning"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${complete ? "bg-success" : "bg-warning"}`}
        />
        {complete ? "Profil to'liq" : "Profil to'liq emas"}
      </div>

      <div className="flex gap-2 mt-5 mb-6">
        {(
          [
            { v: "profil", l: "Profil" },
            { v: "arizalar", l: "Arizalar" },
          ] as const
        ).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`h-9 px-4 rounded-full text-[14px] font-medium border ${
              tab === t.v
                ? "bg-ink text-white border-ink"
                : "bg-canvas text-ink border-hairline"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "profil" ? (
        <ChildProfile
          childId={childId}
          profile={data.profile}
          onSaved={load}
        />
      ) : (
        <ChildApplications
          childId={childId}
          applications={data.applications}
          complete={complete}
          onChanged={load}
        />
      )}
    </div>
  );
}

// ─── Profile editor ─────────────────────────────────────────────
function ChildProfile({
  childId,
  profile,
  onSaved,
}: {
  childId: string;
  profile: Profile | null;
  onSaved: () => Promise<void>;
}) {
  const [f, setF] = useState({
    school: profile?.school || "",
    phone: profile?.phone || "",
    country: profile?.country || "",
    citizenship: profile?.citizenship || "",
    address: profile?.address || "",
    passportId: profile?.passportId || "",
    graduationYear: profile?.graduationYear || "",
    photo: profile?.photo || null,
    idCardFront: profile?.idCardFront || null,
    idCardBack: profile?.idCardBack || null,
    diploma: profile?.diploma || null,
    ieltsOverall: profile?.ielts?.overall || "",
    dtmTotal: profile?.dtm?.total || "",
    satTotal: profile?.sat?.total || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof f, v: string | null) =>
    setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiJson(`/api/parent/children/${childId}/profile`, {
        method: "PUT",
        body: {
          ...profile,
          school: f.school,
          phone: f.phone,
          country: f.country,
          citizenship: f.citizenship,
          address: f.address,
          passportId: f.passportId,
          graduationYear: f.graduationYear,
          photo: f.photo,
          idCardFront: f.idCardFront,
          idCardBack: f.idCardBack,
          diploma: f.diploma,
          ielts: f.ieltsOverall
            ? { ...(profile?.ielts || {}), overall: f.ieltsOverall }
            : null,
          dtm: f.dtmTotal
            ? { ...(profile?.dtm || {}), total: f.dtmTotal }
            : null,
          sat: f.satTotal
            ? { ...(profile?.sat || {}), total: f.satTotal }
            : null,
        },
      });
      setSaved(true);
      await onSaved();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card title="Shaxsiy ma'lumotlar">
        <Txt label="Telefon" v={f.phone} on={(v) => set("phone", v)} />
        <Txt label="Maktab" v={f.school} on={(v) => set("school", v)} />
        <Txt label="Davlat" v={f.country} on={(v) => set("country", v)} />
        <Txt
          label="Fuqarolik"
          v={f.citizenship}
          on={(v) => set("citizenship", v)}
        />
        <Txt label="Manzil" v={f.address} on={(v) => set("address", v)} />
        <Txt
          label="Passport ID"
          v={f.passportId}
          on={(v) => set("passportId", v)}
        />
        <Txt
          label="Bitirgan yili"
          v={f.graduationYear}
          on={(v) => set("graduationYear", v)}
        />
      </Card>

      <Card title="Test natijalari (ixtiyoriy)">
        <Txt
          label="IELTS (umumiy)"
          v={f.ieltsOverall}
          on={(v) => set("ieltsOverall", v)}
        />
        <Txt label="DTM (ball)" v={f.dtmTotal} on={(v) => set("dtmTotal", v)} />
        <Txt label="SAT (umumiy)" v={f.satTotal} on={(v) => set("satTotal", v)} />
      </Card>

      <Card title="Hujjatlar">
        <FileUp
          label="Rasm (JPG/PNG)"
          kind="image"
          accept="image/jpeg,image/png"
          value={f.photo}
          onChange={(v) => set("photo", v)}
        />
        <FileUp
          label="ID karta (old)"
          kind="image"
          accept="image/jpeg,image/png"
          value={f.idCardFront}
          onChange={(v) => set("idCardFront", v)}
        />
        <FileUp
          label="ID karta (orqa)"
          kind="image"
          accept="image/jpeg,image/png"
          value={f.idCardBack}
          onChange={(v) => set("idCardBack", v)}
        />
        <FileUp
          label="Diplom / attestat"
          kind="doc"
          accept="image/jpeg,image/png,application/pdf"
          value={f.diploma}
          onChange={(v) => set("diploma", v)}
        />
      </Card>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="h-11 px-5 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        {saved && (
          <span className="text-[14px] text-success font-medium">✓ Saqlandi</span>
        )}
      </div>
    </div>
  );
}

// ─── Applications ───────────────────────────────────────────────
function ChildApplications({
  childId,
  applications,
  complete,
  onChanged,
}: {
  childId: string;
  applications: Application[];
  complete: boolean;
  onChanged: () => Promise<void>;
}) {
  const [unis, setUnis] = useState<University[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    apiJson<University[]>("/api/universities").then(setUnis).catch(() => {});
  }, []);

  const appliedIds = useMemo(
    () => new Set(applications.map((a) => a.universityId)),
    [applications],
  );
  const submittable = applications.filter(
    (a) => a.status === "YUBORILMAGAN" && !a.needsEntranceExam,
  );

  const submit = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await apiJson<{ submitted: number }>(
        `/api/parent/children/${childId}/applications/submit`,
        { body: { ids } },
      );
      setMsg(`${res.submitted} ta ariza yuborildi.`);
      setSelected(new Set());
      await onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {!complete && (
        <div className="text-[13px] bg-warning/10 text-warning rounded-md p-3">
          Ariza yuborish uchun avval «Profil» bo&apos;limini to&apos;liq
          to&apos;ldiring.
        </div>
      )}

      {applications.length > 0 && (
        <div>
          <h2 className="text-[16px] font-semibold text-ink mb-2">
            Joriy arizalar
          </h2>
          <div className="space-y-2">
            {applications.map((a) => {
              const selectable =
                a.status === "YUBORILMAGAN" && !a.needsEntranceExam;
              return (
                <div
                  key={a.id}
                  className="border border-hairline rounded-md p-3 flex items-center gap-3"
                >
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() =>
                        setSelected((p) => {
                          const n = new Set(p);
                          if (n.has(a.id)) n.delete(a.id);
                          else n.add(a.id);
                          return n;
                        })
                      }
                      className="w-5 h-5 accent-primary"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-ink truncate">
                      {a.university.name}
                    </div>
                    <div className="text-[12px] text-muted">
                      {a.major.name} · {PART_OF_DAY_LABEL[a.partOfDay]}
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-muted">
                    {APPLICATION_STATUS_LABEL[a.status]}
                  </span>
                </div>
              );
            })}
          </div>
          {submittable.length > 0 && (
            <button
              onClick={submit}
              disabled={busy || selected.size === 0 || !complete}
              className="mt-3 h-11 px-5 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-50"
            >
              {busy ? "Yuborilmoqda..." : `Yuborish (${selected.size})`}
            </button>
          )}
          {msg && <p className="text-[13px] text-ink mt-2">{msg}</p>}
        </div>
      )}

      <div>
        <h2 className="text-[16px] font-semibold text-ink mb-2">
          Universitet qo&apos;shish
        </h2>
        <div className="space-y-2">
          {unis
            .filter((u) => !appliedIds.has(u.id))
            .map((u) => (
              <div
                key={u.id}
                className="border border-hairline rounded-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenId((p) => (p === u.id ? null : u.id))
                  }
                  className="w-full text-left p-3"
                >
                  <div className="text-[14px] font-semibold text-ink">
                    {u.name}
                  </div>
                  <div className="text-[12px] text-muted">
                    {u.city} · Muddat: {formatDate(u.deadline)}
                  </div>
                </button>
                {openId === u.id && (
                  <div className="border-t border-hairline-soft p-3">
                    <ApplyForm
                      childId={childId}
                      uni={u}
                      onApplied={async () => {
                        setOpenId(null);
                        await onChanged();
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function ApplyForm({
  childId,
  uni,
  onApplied,
}: {
  childId: string;
  uni: University;
  onApplied: () => Promise<void>;
}) {
  const [majorId, setMajorId] = useState(uni.majors[0]?.id || "");
  const major = uni.majors.find((m) => m.id === majorId) as Major | undefined;
  const [partOfDay, setPartOfDay] = useState<PartOfDay>(
    (major?.partsOfDay[0] as PartOfDay) || "kunduzgi",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (uni.majors.length === 0) {
    return (
      <div className="text-[13px] text-muted">
        Mutaxassisliklar kiritilmagan.
      </div>
    );
  }

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiJson(`/api/parent/children/${childId}/applications`, {
        body: { universityId: uni.id, majorId, partOfDay },
      });
      await onApplied();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
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
      {error && <p className="text-[13px] text-error">{error}</p>}
      <button
        onClick={apply}
        disabled={busy}
        className="w-full h-10 rounded-md bg-primary text-white text-[14px] font-medium disabled:opacity-60"
      >
        {busy ? "Qo'shilmoqda..." : "Arizaga qo'shish"}
      </button>
    </div>
  );
}

// ─── Small UI helpers ───────────────────────────────────────────
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-hairline rounded-md p-5">
      <h2 className="text-[15px] font-semibold text-ink mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Txt({
  label,
  v,
  on,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[13px] font-medium text-ink mb-1.5">{label}</div>
      <input
        value={v}
        onChange={(e) => on(e.target.value)}
        className="w-full h-11 px-3 rounded-md border border-hairline bg-canvas text-[14px]"
      />
    </div>
  );
}

function FileUp({
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
      <div className="text-[13px] font-medium text-ink mb-1.5">{label}</div>
      {value ? (
        <div className="flex items-center justify-between border border-hairline rounded-md px-3 py-2.5">
          <a
            href={`/api/files/${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-ink truncate"
          >
            📄 Yuklandi
          </a>
          <button
            onClick={() => onChange(null)}
            className="text-[13px] text-error font-medium ml-3"
          >
            O&apos;chirish
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center border border-dashed border-hairline rounded-md py-4 text-[13px] text-muted cursor-pointer">
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
