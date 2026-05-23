import { handle, error } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return handle(async () => {
    const uni = await prisma.university.findUnique({
      where: { slug },
      include: { majors: true, exams: { orderBy: { date: "asc" } } },
    });
    if (!uni) throw new Error("Universitet topilmadi.");
    return uni;
  });
}
