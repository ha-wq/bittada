import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Student approves or rejects a parent's link request.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handle(async () => {
    const user = await requireUser();
    const { action } = (await req.json()) as { action: "approve" | "reject" };

    const link = await prisma.parentLink.findUnique({ where: { id } });
    if (!link || link.childId !== user.id) {
      throw new Error("So'rov topilmadi.");
    }

    if (action === "approve") {
      await prisma.parentLink.update({
        where: { id },
        data: { status: "APPROVED" },
      });
      return { ok: true, status: "APPROVED" };
    }

    // reject → remove the link
    await prisma.parentLink.delete({ where: { id } });
    return { ok: true, status: "REJECTED" };
  });
}
