import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const { email, password } = await req.json();
    if (!email || !password) throw new Error("Email va parolni kiriting.");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) throw new Error("Email yoki parol noto'g'ri.");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Email yoki parol noto'g'ri.");

    await createSession(user.id);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      managesUniversityId: user.managesUniversityId,
    };
  });
}
