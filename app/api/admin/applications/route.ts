import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    if (!admin.managesUniversityId) throw new Error("Universitet biriktirilmagan.");

    return prisma.application.findMany({
      where: {
        universityId: admin.managesUniversityId,
        status: { not: "YUBORILMAGAN" },
      },
      include: {
        user: { include: { profile: true } },
        major: true,
        examRegistration: { include: { exam: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
  });
}
