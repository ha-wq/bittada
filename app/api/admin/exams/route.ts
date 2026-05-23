import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    if (!admin.managesUniversityId) throw new Error("Universitet biriktirilmagan.");
    return prisma.exam.findMany({
      where: { universityId: admin.managesUniversityId },
      orderBy: { date: "asc" },
      include: { _count: { select: { registrations: true } } },
    });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    if (!admin.managesUniversityId) throw new Error("Universitet biriktirilmagan.");
    const body = await req.json();

    return prisma.exam.create({
      data: {
        universityId: admin.managesUniversityId,
        date: new Date(body.date),
        location: body.location,
        subjects: body.subjects || [],
        capacity: Number(body.capacity || 0),
        price: Number(body.price || 0),
      },
    });
  });
}
