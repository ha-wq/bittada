import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Hech qanday ariza tanlanmagan.");
    }

    const apps = await prisma.application.findMany({
      where: { id: { in: ids }, userId: user.id, status: "YUBORILMAGAN" },
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
