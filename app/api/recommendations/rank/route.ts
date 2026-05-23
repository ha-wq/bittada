import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { rankUniversities, type RecommendationAnswer } from "@/lib/gemini";

// Rank universities for the student based on profile + their answers.
export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const body = await req.json();

    const answers: RecommendationAnswer[] = Array.isArray(body?.answers)
      ? body.answers
          .map((a: unknown) => {
            const o = a as { question?: unknown; answer?: unknown };
            return {
              question: String(o?.question ?? "").trim(),
              answer: String(o?.answer ?? "").trim(),
            };
          })
          .filter((a: RecommendationAnswer) => a.question && a.answer)
      : [];

    if (!answers.length) {
      throw new Error("Avval savollarga javob bering.");
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new Error("Profil topilmadi. Avval profilingizni to'ldiring.");
    }

    const universities = await prisma.university.findMany({
      include: { majors: true },
    });
    if (!universities.length) {
      throw new Error("Hozircha tavsiya qilish uchun universitetlar yo'q.");
    }

    const rankings = await rankUniversities(profile, answers, universities);

    // Attach lightweight university info so the client can render cards
    // without a second round-trip.
    const byId = new Map(universities.map((u) => [u.id, u]));
    const results = rankings
      .map((r) => {
        const uni = byId.get(r.universityId);
        if (!uni) return null;
        return {
          fitScore: r.fitScore,
          reason: r.reason,
          matchedMajor: r.matchedMajor || null,
          university: {
            id: uni.id,
            slug: uni.slug,
            name: uni.name,
            shortName: uni.shortName,
            logo: uni.logo,
            city: uni.city,
            tuitionMin: uni.tuitionMin,
            tuitionMax: uni.tuitionMax,
            language: uni.language,
            offersFinancialAid: uni.offersFinancialAid,
            hasEntranceExam: uni.hasEntranceExam,
          },
        };
      })
      .filter(Boolean);

    return { results };
  });
}
