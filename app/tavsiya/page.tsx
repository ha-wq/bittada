"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiJson, isProfileComplete } from "@/lib/auth-context";
import { Button } from "@/components/ui";
import { UniLogo } from "@/components/UniLogo";
import { formatSom } from "@/lib/format";

type Question = { id: string; question: string; options: string[] };

type RankedResult = {
  fitScore: number;
  reason: string;
  matchedMajor: string | null;
  university: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    logo: string;
    city: string;
    tuitionMin: number;
    tuitionMax: number;
    language: string[];
    offersFinancialAid: boolean;
    hasEntranceExam: boolean;
  };
};

type Phase = "intro" | "questions" | "results";

export default function TavsiyaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<RankedResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/kirish");
  }, [user, loading, router]);

  if (loading || !user) return null;

  const profileReady = isProfileComplete(user.profile);

  const startQuestions = async () => {
    setErr(null);
    setBusy(true);
    try {
      const { questions } = await apiJson<{ questions: Question[] }>(
        "/api/recommendations/questions",
        { method: "POST" },
      );
      setQuestions(questions);
      setAnswers({});
      setPhase("questions");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  const submitAnswers = async () => {
    setErr(null);
    setBusy(true);
    try {
      const payload = {
        answers: questions
          .filter((q) => answers[q.id])
          .map((q) => ({ question: q.question, answer: answers[q.id] })),
      };
      const { results } = await apiJson<{ results: RankedResult[] }>(
        "/api/recommendations/rank",
        { body: payload },
      );
      setResults(results);
      setPhase("results");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setBusy(false);
    }
  };

  const allAnswered =
    questions.length > 0 && questions.every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-10">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-wide bg-primary text-white px-2 py-0.5 rounded">
            AI
          </span>
          <h1 className="text-[28px] font-bold text-ink">Universitet tavsiyasi</h1>
        </div>
        <p className="text-[15px] text-muted">
          Sun'iy intellekt profilingiz va bir nechta savolga bergan
          javoblaringiz asosida sizga eng mos universitetlarni tartiblaydi.
        </p>
      </div>

      {err && (
        <div className="bg-[#fde8e8] text-error rounded-md px-4 py-3 mb-6 text-[14px]">
          {err}
        </div>
      )}

      {phase === "intro" && (
        <div className="bg-surface-soft rounded-md p-6">
          {!profileReady ? (
            <>
              <p className="text-[15px] text-ink mb-4">
                AI tavsiyasi profil ma'lumotlaringizga asoslanadi. Avval
                profilingizni to'liq to'ldiring.
              </p>
              <Link href="/profil">
                <Button variant="primary">Profilni to'ldirish</Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-[15px] text-ink mb-4">
                Boshlash uchun tugmani bosing. AI sizning profilingizga qarab 4
                ta qisqa savol beradi, so'ngra eng mos universitetlarni
                ko'rsatadi.
              </p>
              <Button
                variant="primary"
                onClick={startQuestions}
                disabled={busy}
              >
                {busy ? "Tayyorlanmoqda..." : "Tavsiyani boshlash"}
              </Button>
            </>
          )}
        </div>
      )}

      {phase === "questions" && (
        <div className="flex flex-col gap-6">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-canvas border border-hairline rounded-md p-5"
            >
              <p className="text-[15px] font-semibold text-ink mb-3">
                {i + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [q.id]: opt }))
                      }
                      className={`text-left px-4 py-3 rounded-md border text-[14px] transition-colors ${
                        selected
                          ? "border-ink border-2 bg-surface-soft text-ink font-medium"
                          : "border-hairline text-ink hover:border-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={submitAnswers}
              disabled={busy || !allAnswered}
            >
              {busy ? "Tahlil qilinmoqda..." : "Tavsiyani ko'rish"}
            </Button>
            {!allAnswered && (
              <span className="text-[13px] text-muted">
                Barcha savollarga javob bering.
              </span>
            )}
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-[18px] font-semibold text-ink">
              Siz uchun tavsiya etiladi ({results.length})
            </h2>
            <Button variant="secondary" size="sm" onClick={() => setPhase("intro")}>
              Qaytadan boshlash
            </Button>
          </div>

          {results.length === 0 && (
            <div className="text-center py-16 text-muted">
              Mos universitet topilmadi.
            </div>
          )}

          {results.map((r, i) => (
            <Link
              key={r.university.id}
              href={`/universitetlar/${r.university.slug}`}
              className="bg-canvas border border-hairline rounded-md p-5 hover:shadow-card transition-shadow flex gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-strong text-ink font-bold overflow-hidden">
                <UniLogo
                  logo={r.university.logo}
                  alt={r.university.shortName}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-muted">
                        #{i + 1}
                      </span>
                      <span className="text-[16px] font-semibold text-ink">
                        {r.university.name}
                      </span>
                    </div>
                    <div className="text-[13px] text-muted mt-0.5">
                      {r.university.city} ·{" "}
                      {formatSom(r.university.tuitionMin)} dan
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#e6f7e6] text-success">
                    {r.fitScore}% mos
                  </span>
                </div>
                {r.matchedMajor && (
                  <div className="text-[13px] text-ink mt-2">
                    <span className="text-muted">Tavsiya etilgan yo'nalish: </span>
                    {r.matchedMajor}
                  </div>
                )}
                <p className="text-[14px] text-ink mt-2">{r.reason}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
