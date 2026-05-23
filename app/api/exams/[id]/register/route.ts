import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;
  return handle(async () => {
    const user = await requireUser();
    const { applicationId } = await req.json();

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!exam) throw new Error("Imtihon topilmadi.");
    if (exam._count.registrations >= exam.capacity) {
      throw new Error("Bu imtihon uchun joylar tugagan.");
    }

    const app = applicationId
      ? await prisma.application.findUnique({ where: { id: applicationId } })
      : null;
    if (applicationId && (!app || app.userId !== user.id)) {
      throw new Error("Ariza topilmadi.");
    }

    const reg = await prisma.examRegistration.upsert({
      where: { examId_userId: { examId, userId: user.id } },
      create: { examId, userId: user.id },
      update: {},
    });

    if (app) {
      await prisma.application.update({
        where: { id: app.id },
        data: { examRegistrationId: reg.id, needsEntranceExam: false },
      });
    }

    return { ok: true };
  });
}
