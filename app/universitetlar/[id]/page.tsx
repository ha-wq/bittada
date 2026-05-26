"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatDate,
  formatSom,
  PART_OF_DAY_LABEL,
} from "@/lib/format";
import { isProfileComplete, useAuth, apiJson } from "@/lib/auth-context";
import { UniLogo } from "@/components/UniLogo";
import { PartOfDay, University } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

export default function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = use(params);
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [uni, setUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<string>("");

  useEffect(() => {
    apiJson<University>(`/api/universities/${slug}`)
      .then((u) => { setUni(u); setSelectedMajorId(u.majors[0]?.id ?? ""); })
      .catch(() => setUni(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-8 py-16 text-muted">Yuklanmoqda...</div>;
  }
  if (!uni) {
    return <div className="mx-auto max-w-6xl px-8 py-16 text-muted">Universitet topilmadi.</div>;
  }

  const alreadyApplied = user?.applications.some((a) => a.universityId === uni.id);
  const selectedMajor = uni.majors.find((m) => m.id === selectedMajorId) ?? null;

  const onApply = () => {
    setError(null);
    if (!user) {
      router.push("/kirish");
      return;
    }
    if (!isProfileComplete(user.profile)) {
      router.push("/profil?from=apply");
      return;
    }
    if (alreadyApplied) {
      router.push("/arizalar");
      return;
    }
    setShowApplyModal(true);
  };

  const submitApply = async (data: {
    majorId: string;
    partOfDay: PartOfDay;
    financialAid: boolean;
  }) => {
    try {
      await apiJson("/api/applications", {
        body: { universityId: uni.id, ...data },
      });
      await refresh();
      setShowApplyModal(false);
      router.push("/arizalar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink mb-6"
      >
        ← Universitetlar
      </Link>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div>
          <div className="aspect-[16/8] bg-gradient-to-br from-surface-strong to-surface-soft rounded-md flex items-center justify-center relative overflow-hidden mb-6">
            <UniLogo
              logo={uni.logo}
              alt={uni.name}
              className="absolute inset-0 w-full h-full object-cover"
              textClassName="text-9xl font-bold text-ink/15"
            />
            <span className="absolute top-4 left-4 bg-canvas px-3 py-1.5 rounded-full text-[12px] font-semibold shadow-card">
              {uni.shortName}
            </span>
          </div>

          <h1 className="text-[28px] font-bold text-ink leading-tight">{uni.name}</h1>
          <p className="text-[15px] text-muted mt-2">📍 {uni.address}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {uni.language.map((l) => (
              <Badge key={l} variant="neutral">{l} tilida</Badge>
            ))}
            {uni.offersFinancialAid && <Badge variant="success">Grant mavjud</Badge>}
            {uni.hasEntranceExam && <Badge variant="info">Ichki imtihon mavjud</Badge>}
          </div>

          {/* Quick stat strip */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <StatPill label="Ohirgi muddat" value={formatDate(uni.deadline)} />
            <StatPill label="Shahar" value={uni.city} />
            <StatPill label="Yo'nalishlar" value={`${uni.majors.length} ta`} />
          </div>

          <p className="text-[16px] text-body mt-6 leading-relaxed">{uni.description}</p>

          <Section title="Talablar">
            <ul className="space-y-2">
              {uni.minDtm && (
                <li className="flex items-center gap-2 text-[15px] text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  DTM ball: kamida <span className="font-semibold text-ink">{uni.minDtm}</span>
                </li>
              )}
              {uni.minIelts && (
                <li className="flex items-center gap-2 text-[15px] text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  IELTS: kamida <span className="font-semibold text-ink">{uni.minIelts}</span>
                </li>
              )}
              {uni.minSat && (
                <li className="flex items-center gap-2 text-[15px] text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  SAT: kamida <span className="font-semibold text-ink">{uni.minSat}</span>
                </li>
              )}
              {uni.minGpa && (
                <li className="flex items-center gap-2 text-[15px] text-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  GPA: kamida <span className="font-semibold text-ink">{uni.minGpa}</span>
                </li>
              )}
              {uni.requirementsNote && (
                <li className="flex items-center gap-2 text-[15px] text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-strong flex-shrink-0" />
                  {uni.requirementsNote}
                </li>
              )}
            </ul>
          </Section>

          <Section title={`Mutaxassisliklar (${uni.majors.length})`}>
            <div className="grid sm:grid-cols-2 gap-3">
              {uni.majors.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMajorId(m.id)}
                  className={`text-left border rounded-md p-4 transition-colors ${
                    selectedMajorId === m.id
                      ? "border-primary bg-primary/[0.04]"
                      : "border-hairline hover:border-ink/30"
                  }`}
                >
                  <div className="font-medium text-ink">{m.name}</div>
                  <div className="text-[13px] text-muted mt-1">
                    {m.partsOfDay.map((p) => PART_OF_DAY_LABEL[p]).join(" · ")}
                  </div>
                  <div className="text-[13px] font-medium text-primary mt-2">
                    {formatSom(m.tuitionFee)} / yil
                  </div>
                </button>
              ))}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-canvas border border-hairline rounded-md p-6 shadow-card">
            {/* Tuition — updates when major is selected */}
            <div className="text-[13px] text-muted">
              {selectedMajor ? selectedMajor.name : "Yo'nalish tanlang"}
            </div>
            <div className="text-[28px] font-bold text-ink mt-1 leading-none">
              {formatSom(selectedMajor?.tuitionFee ?? uni.tuitionMin)}
            </div>
            <div className="text-[13px] text-muted mt-1">/ yil</div>

            <div className="border-t border-hairline my-5" />

            {/* Major picker */}
            <div className="mb-4">
              <div className="text-[13px] font-medium text-ink mb-2">Yo'nalish</div>
              <div className="space-y-1.5">
                {uni.majors.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMajorId(m.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors flex items-center gap-2.5 ${
                      selectedMajorId === m.id
                        ? "bg-primary text-white font-medium"
                        : "text-body hover:bg-surface-soft"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      selectedMajorId === m.id ? "border-white" : "border-ink/30"
                    }`}>
                      {selectedMajorId === m.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-hairline my-4" />

            <div className="text-[13px] text-body space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Ohirgi muddat</span>
                <span className="text-ink font-medium">{formatDate(uni.deadline)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shahar</span>
                <span className="text-ink font-medium">{uni.city}</span>
              </div>
            </div>

            <Button onClick={onApply} className="w-full mt-5">
              {alreadyApplied ? "Arizalarni ko'rish" : "Ariza topshirish"}
            </Button>

            {alreadyApplied && (
              <p className="text-[13px] text-success text-center mt-2">
                ✓ Siz bu universitetni tanlagansiz
              </p>
            )}
            {error && (
              <p className="text-[13px] text-error text-center mt-2">{error}</p>
            )}
          </div>
        </aside>
      </div>

      {showApplyModal && (
        <ApplyModal
          uni={uni}
          initialMajorId={selectedMajorId}
          onClose={() => setShowApplyModal(false)}
          onSubmit={submitApply}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 pt-8 border-t border-hairline">
      <h2 className="text-[21px] font-bold text-ink mb-3">{title}</h2>
      {children}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-soft rounded-lg px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="text-[15px] font-semibold text-ink mt-0.5">{value}</div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-canvas rounded-md max-w-md w-full p-6 shadow-card">
        {children}
      </div>
    </div>
  );
}

function ApplyModal({
  uni,
  initialMajorId,
  onClose,
  onSubmit,
}: {
  uni: University;
  initialMajorId?: string;
  onClose: () => void;
  onSubmit: (data: {
    majorId: string;
    partOfDay: PartOfDay;
    financialAid: boolean;
  }) => void;
}) {
  const [majorId, setMajorId] = useState(initialMajorId || uni.majors[0]?.id || "");
  const selectedMajor = uni.majors.find((m) => m.id === majorId);
  const [partOfDay, setPartOfDay] = useState<PartOfDay>(
    (selectedMajor?.partsOfDay[0] as PartOfDay) || "kunduzgi",
  );
  const [financialAid, setFinancialAid] = useState(false);

  return (
    <Modal onClose={onClose}>
      <h2 className="text-[22px] font-bold text-ink">Ariza ma'lumotlari</h2>
      <p className="text-[14px] text-muted mt-1">{uni.name}</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-[14px] font-medium text-ink mb-1.5">
            Mutaxassislik
          </label>
          <select
            value={majorId}
            onChange={(e) => {
              setMajorId(e.target.value);
              const m = uni.majors.find((x) => x.id === e.target.value);
              if (m) setPartOfDay(m.partsOfDay[0] as PartOfDay);
            }}
            className="w-full h-14 px-4 border border-hairline rounded-md text-[15px] focus:outline-none focus:border-ink focus:border-2"
          >
            {uni.majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {selectedMajor && (
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1.5">
              O'qish shakli
            </label>
            <div className="flex gap-2 flex-wrap">
              {selectedMajor.partsOfDay.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPartOfDay(p as PartOfDay)}
                  className={`h-11 px-4 rounded-full text-[14px] font-medium border ${
                    partOfDay === p
                      ? "bg-ink text-white border-ink"
                      : "bg-canvas text-ink border-hairline hover:border-ink"
                  }`}
                >
                  {PART_OF_DAY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        {uni.offersFinancialAid && (
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1.5">
              Moliyaviy yordam / grant uchun ariza
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFinancialAid(true)}
                className={`h-11 px-5 rounded-full text-[14px] font-medium border ${
                  financialAid
                    ? "bg-ink text-white border-ink"
                    : "bg-canvas text-ink border-hairline hover:border-ink"
                }`}
              >
                Ha
              </button>
              <button
                type="button"
                onClick={() => setFinancialAid(false)}
                className={`h-11 px-5 rounded-full text-[14px] font-medium border ${
                  !financialAid
                    ? "bg-ink text-white border-ink"
                    : "bg-canvas text-ink border-hairline hover:border-ink"
                }`}
              >
                Yo'q
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          onClick={() => onSubmit({ majorId, partOfDay, financialAid })}
          className="flex-1"
        >
          Ro'yxatga qo'shish
        </Button>
      </div>
    </Modal>
  );
}
