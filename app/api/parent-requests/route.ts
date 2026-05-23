import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Student lists incoming parent link requests (pending + approved).
export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const links = await prisma.parentLink.findMany({
      where: { childId: user.id },
      include: {
        parent: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return links.map((l) => ({
      id: l.id,
      status: l.status,
      parent: l.parent,
      createdAt: l.createdAt,
    }));
  });
}
