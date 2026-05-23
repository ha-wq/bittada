import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    await requireRole("SUPER_ADMIN");
    return prisma.user.findMany({
      where: { role: { in: ["UNIVERSITY_ADMIN", "SUPER_ADMIN"] } },
      include: { manages: true },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireRole("SUPER_ADMIN");
    const { fullName, email, password, universityId } = await req.json();
    if (!fullName || !email || !password || !universityId) {
      throw new Error("Barcha maydonlarni to'ldiring.");
    }
    if (password.length < 6) throw new Error("Parol kamida 6 belgi.");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Bu email allaqachon mavjud.");

    const uni = await prisma.university.findUnique({ where: { id: universityId } });
    if (!uni) throw new Error("Universitet topilmadi.");

    return prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(password, 10),
        fullName,
        role: "UNIVERSITY_ADMIN",
        managesUniversityId: universityId,
      },
    });
  });
}
