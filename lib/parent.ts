import "server-only";
import { prisma } from "./db";
import { requireUser, AuthError } from "./session";

/**
 * Ensure the current user is a PARENT with an APPROVED link to `childId`.
 * Returns the parent user. Throws AuthError otherwise.
 */
export async function requireApprovedChild(childId: string) {
  const parent = await requireUser();
  if (parent.role !== "PARENT") {
    throw new AuthError("Faqat ota-onalar uchun.", 403);
  }
  const link = await prisma.parentLink.findUnique({
    where: { parentId_childId: { parentId: parent.id, childId } },
  });
  if (!link || link.status !== "APPROVED") {
    throw new AuthError("Bu farzand sizga biriktirilmagan.", 403);
  }
  return parent;
}
