import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { generateQuestions } from "@/lib/gemini";

// Generate AI questions tailored to the student's profile.
export async function POST() {
  return handle(async () => {
    const user = await requireUser();

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new Error(
        "Avval profilingizni to'ldiring — AI tavsiyasi profil ma'lumotlariga asoslanadi.",
      );
    }

    const questions = await generateQuestions(profile);
    return { questions };
  });
}
