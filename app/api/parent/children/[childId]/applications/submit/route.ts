import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApprovedChild } from "@/lib/parent";
import { isProfileComplete } from "@/lib/profile";

// Parent submits an approved child's selected applications.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params;
  return handle(async () => {
    await requireApprovedChild(childId);
    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Hech qanday ariza tanlanmagan.");
    }

    // Gate on a complete profile before anything reaches universities.
    const profile = await prisma.profile.findUnique({
      where: { userId: childId },
    });
    if (!isProfileComplete(profile)) {
      throw new Error("Avval farzandning profilini to'liq to'ldiring.");
    }

    const apps = await prisma.application.findMany({
      where: { id: { in: ids }, userId: childId, status: "YUBORILMAGAN" },
    });
    const eligible = apps.filter((a) => !a.needsEntranceExam);
    if (eligible.length === 0) throw new Error("Yuboriladigan ariza topilmadi.");

    await prisma.application.updateMany({
      where: { id: { in: eligible.map((a) => a.id) } },
      data: { status: "KORIB_CHIQILMOQDA", submittedAt: new Date() },
    });
    return { submitted: eligible.length };
  });
}
