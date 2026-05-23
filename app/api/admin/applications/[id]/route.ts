import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

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
    return prisma.application.update({
      where: { id },
      data: {
        status,
        decidedAt: status === "KORIB_CHIQILMOQDA" ? null : new Date(),
      },
    });
  });
}
