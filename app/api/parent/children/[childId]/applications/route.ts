import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApprovedChild } from "@/lib/parent";

// Parent creates an application on behalf of an approved child.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params;
  return handle(async () => {
    await requireApprovedChild(childId);
    const { universityId, majorId, partOfDay, financialAid } =
      await req.json();

    if (!universityId || !majorId || !partOfDay) {
      throw new Error("Universitet, mutaxassislik va o'qish shaklini tanlang.");
    }

    const existing = await prisma.application.findFirst({
      where: { userId: childId, universityId },
    });
    if (existing) throw new Error("Bu universitetga allaqachon ariza qo'shilgan.");

    const [uni, profile] = await Promise.all([
      prisma.university.findUnique({ where: { id: universityId } }),
      prisma.profile.findUnique({ where: { userId: childId } }),
    ]);
    if (!uni) throw new Error("Universitet topilmadi.");

    const ielts = (profile?.ielts as { overall?: string } | null)?.overall;
    const dtm = (profile?.dtm as { total?: string } | null)?.total;
    const sat = (profile?.sat as { total?: string } | null)?.total;

    const hasReq = !!(uni.minIelts || uni.minDtm || uni.minSat);
    const meetsAny =
      (uni.minIelts && Number(ielts || 0) >= uni.minIelts) ||
      (uni.minDtm && Number(dtm || 0) >= uni.minDtm) ||
      (uni.minSat && Number(sat || 0) >= uni.minSat);
    const meets = !hasReq || !!meetsAny;

    return prisma.application.create({
      data: {
        userId: childId,
        universityId,
        majorId,
        partOfDay,
        financialAid: !!financialAid,
        needsEntranceExam: uni.hasEntranceExam && !meets,
      },
      include: { university: true, major: true },
    });
  });
}
