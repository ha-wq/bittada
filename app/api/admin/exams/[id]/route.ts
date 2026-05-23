import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.universityId !== admin.managesUniversityId) {
      throw new Error("Imtihon topilmadi.");
    }
    const body = await req.json();
    return prisma.exam.update({
      where: { id },
      data: {
        date: new Date(body.date),
        location: body.location,
        subjects: body.subjects || [],
        capacity: Number(body.capacity || 0),
        price: Number(body.price || 0),
      },
    });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.universityId !== admin.managesUniversityId) {
      throw new Error("Imtihon topilmadi.");
    }
    await prisma.exam.delete({ where: { id } });
    return { ok: true };
  });
}
