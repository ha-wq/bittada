import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
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
      where: { userId: user.id },
      create: { userId: user.id, ...data } as never,
      update: data as never,
    });
    return profile;
  });
}
