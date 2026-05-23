"use client";

import { useEffect, useState, use } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import {
  UNIVERSITIES,
  formatDate,
  formatSom,
  PART_OF_DAY_LABEL,
  getUniversity,
} from "@/lib/mock-universities";
import { isProfileComplete, useAuth } from "@/lib/auth-context";
import { Application, PartOfDay } from "@/lib/types";
import { Badge, Button } from "@/components/ui";

export default function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const uni = getUniversity(id);
  const { user, addApplication } = useAuth();
  const router = useRouter();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(false);

  useEffect(() => {
    if (!uni) notFound();
  }, [uni]);

  if (!uni) return null;

  const alreadyApplied = user?.applications.some((a) => a.universityId === uni.id);

  const onApply = () => {
    if (!user) {
      router.push("/kirish");
      return;
    }
    if (!isProfileComplete(user.profile)) {
      setShowProfileBanner(true);
      return;
    }
    if (alreadyApplied) {
      router.push("/arizalar");
      return;
    }
    setShowApplyModal(true);
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
            <span className="text-9xl font-bold text-ink/15">{uni.logo}</span>
            <span className="absolute top-4 left-4 bg-canvas px-3 py-1.5 rounded-full text-[12px] font-semibold shadow-card">
              {uni.shortName}
            </span>
          </div>

          <h1 className="text-[28px] font-bold text-ink leading-tight">{uni.name}</h1>
          <p className="text-[15px] text-muted mt-2">
            📍 {uni.address}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {uni.language.map((l) => (
              <Badge key={l} variant="neutral">
                {l} tilida
              </Badge>
            ))}
            {uni.offersFinancialAid && <Badge variant="success">Grant mavjud</Badge>}
            {uni.hasEntranceExam && (
              <Badge variant="info">Ichki imtihon mavjud</Badge>
            )}
          </div>

          <p className="text-[16px] text-body mt-6 leading-relaxed">
            {uni.description}
          </p>

          <Section title="O'qish narxi">
            <p className="text-[16px] text-ink">
              <span className="font-semibold">{formatSom(uni.tuitionMin)}</span>
              {" – "}
              <span className="font-semibold">{formatSom(uni.tuitionMax)}</span>
              <span className="text-muted"> / yil</span>
            </p>
          </Section>

          <Section title="Topshirish muddati">
            <p className="text-[16px] text-ink">{formatDate(uni.deadline)}</p>
          </Section>

          <Section title="Talablar">
            <ul className="space-y-2 text-[15px] text-body">
              {uni.requirements.minDtm && (
                <li>• DTM ball: kamida {uni.requirements.minDtm}</li>
              )}
              {uni.requirements.minIelts && (
                <li>• IELTS: kamida {uni.requirements.minIelts}</li>
              )}
              {uni.requirements.minSat && (
                <li>• SAT: kamida {uni.requirements.minSat}</li>
              )}
              {uni.requirements.minGpa && (
                <li>• GPA: kamida {uni.requirements.minGpa}</li>
              )}
              {uni.requirements.note && (
                <li className="text-muted">• {uni.requirements.note}</li>
              )}
            </ul>
          </Section>

          <Section title={`Mutaxassisliklar (${uni.majors.length})`}>
            <div className="grid sm:grid-cols-2 gap-3">
              {uni.majors.map((m) => (
                <div
                  key={m.id}
                  className="border border-hairline rounded-md p-4"
                >
                  <div className="font-medium text-ink">{m.name}</div>
                  <div className="text-[13px] text-muted mt-1">
                    {m.partsOfDay
                      .map((p) => PART_OF_DAY_LABEL[p])
                      .join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-canvas border border-hairline rounded-md p-6 shadow-card">
            <div className="text-[15px] text-muted">Yillik narx</div>
            <div className="text-[24px] font-bold text-ink mt-1">
              {formatSom(uni.tuitionMin)}
            </div>
            <div className="text-[13px] text-muted">dan boshlab</div>

            <div className="border-t border-hairline my-5" />

            <div className="text-[14px] text-body space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Muddat</span>
                <span className="text-ink font-medium">
                  {formatDate(uni.deadline)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mutaxassisliklar</span>
                <span className="text-ink font-medium">{uni.majors.length}</span>
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
          </div>
        </aside>
      </div>

      {showProfileBanner && (
        <Modal onClose={() => setShowProfileBanner(false)}>
          <h2 className="text-[20px] font-bold text-ink">
            Profilingizni to'ldiring
          </h2>
          <p className="text-[15px] text-body mt-2">
            Ariza topshirish uchun avval profilingizni to'liq to'ldirishingiz
            kerak. Bu hujjatlar barcha universitetlar uchun bir marta
            to'ldiriladi.
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowProfileBanner(false)}
            >
              Bekor qilish
            </Button>
            <Button onClick={() => router.push("/profil")}>
              Profilga o'tish
            </Button>
          </div>
        </Modal>
      )}

      {showApplyModal && (
        <ApplyModal
          uni={uni}
          onClose={() => setShowApplyModal(false)}
          onSubmit={(data) => {
            const requirements = uni.requirements;
            const dtm = Number(user?.profile?.dtm?.total || 0);
            const ielts = Number(user?.profile?.ielts?.overall || 0);
            const sat = Number(user?.profile?.sat?.total || 0);
            const meetsDtm = !requirements.minDtm || dtm >= requirements.minDtm;
            const meetsIelts =
              !requirements.minIelts || ielts >= requirements.minIelts;
            const meetsSat = !requirements.minSat || sat >= requirements.minSat;
            const meets = meetsDtm && meetsIelts && meetsSat;
            const app: Application = {
              id: crypto.randomUUID(),
              universityId: uni.id,
              majorId: data.majorId,
              partOfDay: data.partOfDay,
              financialAid: data.financialAid,
              status: "yuborilmagan",
              needsEntranceExam: uni.hasEntranceExam && !meets,
              createdAt: new Date().toISOString(),
            };
            addApplication(app);
            setShowApplyModal(false);
            router.push("/arizalar");
          }}
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
  onClose,
  onSubmit,
}: {
  uni: (typeof UNIVERSITIES)[number];
  onClose: () => void;
  onSubmit: (data: {
    majorId: string;
    partOfDay: PartOfDay;
    financialAid: boolean;
  }) => void;
}) {
  const [majorId, setMajorId] = useState(uni.majors[0].id);
  const selectedMajor = uni.majors.find((m) => m.id === majorId)!;
  const [partOfDay, setPartOfDay] = useState<PartOfDay>(selectedMajor.partsOfDay[0]);
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
              const m = uni.majors.find((x) => x.id === e.target.value)!;
              setPartOfDay(m.partsOfDay[0]);
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

        <div>
          <label className="block text-[14px] font-medium text-ink mb-1.5">
            O'qish shakli
          </label>
          <div className="flex gap-2 flex-wrap">
            {selectedMajor.partsOfDay.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPartOfDay(p)}
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
