import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApprovedChild } from "@/lib/parent";

// Parent reads an approved child's profile + applications.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params;
  return handle(async () => {
    await requireApprovedChild(childId);

    const [child, profile, applications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: childId },
        select: { id: true, fullName: true, email: true },
      }),
      prisma.profile.findUnique({ where: { userId: childId } }),
      prisma.application.findMany({
        where: { userId: childId },
        include: {
          university: true,
          major: true,
          examRegistration: { include: { exam: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { child, profile, applications };
  });
}
