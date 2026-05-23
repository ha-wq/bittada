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

    let keptCount = 0;
    if (Array.isArray(majors)) {
      // Diff-based upsert so majors with existing applications keep their id.
      const incoming = majors as {
        id?: string;
        name: string;
        partsOfDay?: string[];
      }[];
      const existing = await prisma.major.findMany({
        where: { universityId: uni.id },
      });
      const isReal = (id?: string) => !!id && !id.startsWith("tmp-");
      const incomingRealIds = new Set(
        incoming.filter((m) => isReal(m.id)).map((m) => m.id as string),
      );

      for (const m of incoming) {
        if (!m.name?.trim()) continue;
        if (isReal(m.id) && existing.some((e) => e.id === m.id)) {
          await prisma.major.update({
            where: { id: m.id as string },
            data: { name: m.name, partsOfDay: m.partsOfDay || [] },
          });
        } else {
          await prisma.major.create({
            data: {
              universityId: uni.id,
              name: m.name,
              partsOfDay: m.partsOfDay || [],
            },
          });
        }
      }

      for (const e of existing) {
        if (incomingRealIds.has(e.id)) continue;
        const appCount = await prisma.application.count({
          where: { majorId: e.id },
        });
        if (appCount === 0) {
          await prisma.major.delete({ where: { id: e.id } });
        } else {
          keptCount += 1;
        }
      }
    }

    const updated = await prisma.university.findUnique({
      where: { id: uni.id },
      include: { majors: true },
    });
    return {
      ...updated,
      _warning:
        keptCount > 0
          ? `${keptCount} ta mutaxassislik o'chirilmadi — ularga ariza biriktirilgan.`
          : undefined,
    };
  });
}
