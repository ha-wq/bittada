import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { handle, error } from "@/lib/api";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json();
    const { fullName, email, password, dateOfBirth } = body;

    if (!fullName || !email || !password) {
      throw new Error("Barcha maydonlarni to'ldiring.");
    }
    if (password.length < 6) {
      throw new Error("Parol kamida 6 belgidan iborat bo'lishi kerak.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Bu email allaqachon ro'yxatdan o'tgan.");

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(password, 10),
        fullName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: "STUDENT",
        profile: { create: {} },
      },
    });

    await createSession(user.id);
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
  });
}
