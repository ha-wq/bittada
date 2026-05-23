import "server-only";
import { prisma } from "./db";
import { isProfileComplete } from "./profile";

export type ScoutSummary = {
  created: number;
  submitted: number;
  needExam: number;
};

const lc = (s: string) => s.toLowerCase().trim();
const intersects = (a: string[], b: string[]) => {
  const set = new Set(b.map(lc));
  return a.some((x) => set.has(lc(x)));
};

/**
 * Run the scouting matcher for a student: find universities matching the
 * student's saved filters, create applications, and auto-submit the eligible
 * ones immediately. Skips universities the student already applied to.
 *
 * Throws if the profile is incomplete (caller should surface the message).
 */
export async function runScouting(userId: string): Promise<ScoutSummary> {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!isProfileComplete(profile)) {
    throw new Error(
      "Skauting uchun profil to'liq bo'lishi kerak (hujjatlar, passport, va h.k.).",
    );
  }
  if (!profile!.scoutingEnabled) return { created: 0, submitted: 0, needExam: 0 };

  const cities = profile!.scoutCities;
  const keywords = profile!.scoutKeywords;
  const parts = profile!.scoutPartsOfDay;
  const langs = profile!.scoutLanguages;
  const willingTest = profile!.scoutWillingTest;
  const budget = profile!.scoutTuitionMax ?? null;

  const ielts = (profile!.ielts as { overall?: string } | null)?.overall;
  const dtm = (profile!.dtm as { total?: string } | null)?.total;
  const sat = (profile!.sat as { total?: string } | null)?.total;

  const [universities, existing] = await Promise.all([
    prisma.university.findMany({ include: { majors: true } }),
    prisma.application.findMany({
      where: { userId },
      select: { universityId: true },
    }),
  ]);
  const appliedUniIds = new Set(existing.map((a) => a.universityId));

  const createdIds: string[] = [];
  let needExam = 0;

  for (const uni of universities) {
    if (appliedUniIds.has(uni.id)) continue;

    // City filter
    if (cities.length && !cities.map(lc).includes(lc(uni.city))) continue;
    // Language filter
    if (langs.length && !intersects(langs, uni.language)) continue;
    // Entrance-exam willingness
    if (!willingTest && uni.hasEntranceExam) continue;

    // Pick a matching major by keyword + day-time + tuition.
    const major = uni.majors.find((m) => {
      const kwOk =
        !keywords.length ||
        keywords.some((k) => lc(m.name).includes(lc(k)));
      const partOk = !parts.length || intersects(parts, m.partsOfDay);
      const tuitionOk = budget == null || m.tuitionFee <= budget;
      return kwOk && partOk && tuitionOk;
    });
    if (!major) continue;

    // Choose the day-time: a preferred one if it matches, else the first.
    const partOfDay =
      (parts.length
        ? major.partsOfDay.find((p) => parts.map(lc).includes(lc(p)))
        : undefined) || major.partsOfDay[0] || "kunduzgi";

    // Replicate the apply-route entrance-exam logic.
    const hasReq = !!(uni.minIelts || uni.minDtm || uni.minSat);
    const meetsAny =
      (uni.minIelts && Number(ielts || 0) >= uni.minIelts) ||
      (uni.minDtm && Number(dtm || 0) >= uni.minDtm) ||
      (uni.minSat && Number(sat || 0) >= uni.minSat);
    const meets = !hasReq || !!meetsAny;
    const needsEntranceExam = uni.hasEntranceExam && !meets;
    if (needsEntranceExam) needExam += 1;

    const app = await prisma.application.create({
      data: {
        userId,
        universityId: uni.id,
        majorId: major.id,
        partOfDay,
        financialAid: profile!.applyingForGrant,
        needsEntranceExam,
      },
    });
    createdIds.push(app.id);
  }

  // Auto-submit everything that doesn't require an entrance exam.
  const submit = await prisma.application.updateMany({
    where: { id: { in: createdIds }, needsEntranceExam: false },
    data: { status: "KORIB_CHIQILMOQDA", submittedAt: new Date() },
  });

  return {
    created: createdIds.length,
    submitted: submit.count,
    needExam,
  };
}
