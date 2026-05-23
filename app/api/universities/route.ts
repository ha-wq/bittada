import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  return handle(async () => {
    const list = await prisma.university.findMany({
      orderBy: { name: "asc" },
      include: { majors: true },
    });
    return list;
  });
}
