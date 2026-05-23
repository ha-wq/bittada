import { handle } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    if (!user) return null;

    const [profile, applications] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.application.findMany({
        where: { userId: user.id },
        include: {
          university: { select: { id: true, slug: true, name: true, shortName: true, logo: true, address: true } },
          major: true,
          examRegistration: { include: { exam: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      managesUniversityId: user.managesUniversityId,
      profile,
      applications,
    };
  });
}
