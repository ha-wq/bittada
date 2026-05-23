import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Unambiguous alphabet (no 0/O/1/I).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_TTL_MS = 24 * 60 * 60 * 1000;

function genCode(len = 6) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

// Student generates (or refreshes) a claim code to share with a parent.
export async function POST() {
  return handle(async () => {
    const user = await requireUser();
    if (user.role !== "STUDENT") {
      throw new Error("Faqat talabalar kod yaratishi mumkin.");
    }

    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    // Retry on the (rare) unique collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = genCode();
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { claimCode: code, claimCodeExpiresAt: expiresAt },
        });
        return { code, expiresAt };
      } catch {
        // collision — try again
      }
    }
    throw new Error("Kod yaratib bo'lmadi, qayta urining.");
  });
}

// Student reads their current active code (if any).
export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const u = await prisma.user.findUnique({
      where: { id: user.id },
      select: { claimCode: true, claimCodeExpiresAt: true },
    });
    const active =
      u?.claimCode &&
      u.claimCodeExpiresAt &&
      u.claimCodeExpiresAt > new Date();
    return active
      ? { code: u!.claimCode, expiresAt: u!.claimCodeExpiresAt }
      : { code: null, expiresAt: null };
  });
}
