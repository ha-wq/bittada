import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";

// Parent lists their linked children (pending + approved).
export async function GET() {
  return handle(async () => {
    const parent = await requireUser();
    if (parent.role !== "PARENT") {
      throw new Error("Faqat ota-ona hisobi uchun.");
    }

    const links = await prisma.parentLink.findMany({
      where: { parentId: parent.id },
      include: {
        child: {
          select: {
            id: true,
            fullName: true,
            profile: true,
            _count: { select: { applications: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return links.map((l) => ({
      linkId: l.id,
      status: l.status,
      child: {
        id: l.child.id,
        fullName: l.child.fullName,
        profileComplete: isProfileComplete(l.child.profile),
        applicationCount: l.child._count.applications,
      },
    }));
  });
}
