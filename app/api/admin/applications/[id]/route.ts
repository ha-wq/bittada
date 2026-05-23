import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { notifyApplicationStatus } from "@/lib/telegram-bot";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app || app.universityId !== admin.managesUniversityId) {
      throw new Error("Ariza topilmadi.");
    }
    const { status } = await req.json();
    if (!["QABUL_QILINDI", "RAD_ETILDI", "KORIB_CHIQILMOQDA"].includes(status)) {
      throw new Error("Noto'g'ri status.");
    }
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        decidedAt: status === "KORIB_CHIQILMOQDA" ? null : new Date(),
      },
    });

    // Notify the student over Telegram (no-op if they have no linked account).
    if (process.env.TELEGRAM_BOT_TOKEN) {
      await notifyApplicationStatus(updated.id);
    }

    return updated;
  });
}
