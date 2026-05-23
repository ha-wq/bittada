import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    return prisma.application.findMany({
      where: { userId: user.id },
      include: {
        university: true,
        major: true,
        examRegistration: { include: { exam: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { universityId, majorId, partOfDay, financialAid } = await req.json();

    if (!universityId || !majorId || !partOfDay) {
      throw new Error("Universitet, mutaxassislik va o'qish shaklini tanlang.");
    }

    const existing = await prisma.application.findFirst({
      where: { userId: user.id, universityId },
    });
    if (existing) throw new Error("Siz bu universitetga allaqachon ariza qo'shgansiz.");

    const [uni, profile] = await Promise.all([
      prisma.university.findUnique({ where: { id: universityId } }),
      prisma.profile.findUnique({ where: { userId: user.id } }),
    ]);
    if (!uni) throw new Error("Universitet topilmadi.");

    const ielts = (profile?.ielts as { overall?: string } | null)?.overall;
    const dtm = (profile?.dtm as { total?: string } | null)?.total;
    const sat = (profile?.sat as { total?: string } | null)?.total;
    const meets =
      (!uni.minIelts || Number(ielts || 0) >= uni.minIelts) &&
      (!uni.minDtm || Number(dtm || 0) >= uni.minDtm) &&
      (!uni.minSat || Number(sat || 0) >= uni.minSat);

    return prisma.application.create({
      data: {
        userId: user.id,
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
