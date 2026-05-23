import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";
import { runScouting } from "@/lib/scouting";

// Save scouting filters. If enabling, require a complete profile and then
// immediately auto-apply to matching universities.
export async function PUT(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const b = await req.json();

    const enabled = !!b.scoutingEnabled;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (enabled && !isProfileComplete(profile)) {
      throw new Error(
        "Skautingni yoqishdan oldin profilni to'liq to'ldiring.",
      );
    }

    const asArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.map(String).filter(Boolean) : [];

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        scoutingEnabled: enabled,
        scoutCities: asArray(b.scoutCities),
        scoutKeywords: asArray(b.scoutKeywords),
        scoutPartsOfDay: asArray(b.scoutPartsOfDay),
        scoutLanguages: asArray(b.scoutLanguages),
        scoutWillingTest: !!b.scoutWillingTest,
        scoutTuitionMax: b.scoutTuitionMax ? Number(b.scoutTuitionMax) : null,
      },
      update: {
        scoutingEnabled: enabled,
        scoutCities: asArray(b.scoutCities),
        scoutKeywords: asArray(b.scoutKeywords),
        scoutPartsOfDay: asArray(b.scoutPartsOfDay),
        scoutLanguages: asArray(b.scoutLanguages),
        scoutWillingTest: !!b.scoutWillingTest,
        scoutTuitionMax: b.scoutTuitionMax ? Number(b.scoutTuitionMax) : null,
      },
    });

    let summary = null;
    if (enabled) {
      summary = await runScouting(user.id);
    }

    return { ok: true, summary };
  });
}
