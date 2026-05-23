import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    if (!admin.managesUniversityId) throw new Error("Universitet biriktirilmagan.");
    return prisma.university.findUnique({
      where: { id: admin.managesUniversityId },
      include: { majors: true },
    });
  });
}

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const admin = await requireRole("UNIVERSITY_ADMIN", "SUPER_ADMIN");
    if (!admin.managesUniversityId) throw new Error("Universitet biriktirilmagan.");
    const body = await req.json();

    const { majors, ...uniData } = body;

    const data: Record<string, unknown> = {
      name: uniData.name,
      shortName: uniData.shortName,
      city: uniData.city,
      address: uniData.address,
      description: uniData.description,
      tuitionMin: Number(uniData.tuitionMin),
      tuitionMax: Number(uniData.tuitionMax),
      deadline: new Date(uniData.deadline),
      language: uniData.language || [],
      offersFinancialAid: !!uniData.offersFinancialAid,
      hasEntranceExam: !!uniData.hasEntranceExam,
      minDtm: uniData.minDtm ? Number(uniData.minDtm) : null,
      minIelts: uniData.minIelts ? Number(uniData.minIelts) : null,
      minSat: uniData.minSat ? Number(uniData.minSat) : null,
      minGpa: uniData.minGpa ? Number(uniData.minGpa) : null,
      requirementsNote: uniData.requirementsNote || null,
    };

    const uni = await prisma.university.update({
      where: { id: admin.managesUniversityId },
      data,
    });

    if (Array.isArray(majors)) {
      // Replace majors atomically — delete then create.
      await prisma.major.deleteMany({ where: { universityId: uni.id } });
      for (const m of majors) {
        if (m.name && m.name.trim()) {
          await prisma.major.create({
            data: {
              universityId: uni.id,
              name: m.name,
              partsOfDay: m.partsOfDay || [],
            },
          });
        }
      }
    }

    return prisma.university.findUnique({
      where: { id: uni.id },
      include: { majors: true },
    });
  });
}
