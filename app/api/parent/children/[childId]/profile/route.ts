import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApprovedChild } from "@/lib/parent";

// Parent updates an approved child's profile.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ childId: string }> },
) {
  const { childId } = await params;
  return handle(async () => {
    await requireApprovedChild(childId);
    const body = await req.json();

    const data: Record<string, unknown> = {
      school: body.school ?? null,
      photo: body.photo ?? null,
      phone: body.phone ?? null,
      country: body.country ?? null,
      citizenship: body.citizenship ?? null,
      address: body.address ?? null,
      passportId: body.passportId ?? null,
      graduationYear: body.graduationYear ?? null,
      idCardFront: body.idCardFront ?? null,
      idCardBack: body.idCardBack ?? null,
      diploma: body.diploma ?? null,
      applyingForGrant: !!body.applyingForGrant,
      ielts: body.ielts ?? null,
      sat: body.sat ?? null,
      dtm: body.dtm ?? null,
      milliySertifikat: body.milliySertifikat ?? null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: childId },
      create: { userId: childId, ...data } as never,
      update: data as never,
    });
    return profile;
  });
}
