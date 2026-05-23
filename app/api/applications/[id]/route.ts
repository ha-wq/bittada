import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(async () => {
    const user = await requireUser();
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app || app.userId !== user.id) throw new Error("Ariza topilmadi.");
    if (app.status !== "YUBORILMAGAN") throw new Error("Yuborilgan arizani o'chirib bo'lmaydi.");
    await prisma.application.delete({ where: { id } });
    return { ok: true };
  });
}
