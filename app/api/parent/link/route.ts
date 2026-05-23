import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Parent submits a child's claim code to request a link.
export async function POST(req: NextRequest) {
  return handle(async () => {
    const parent = await requireUser();
    if (parent.role !== "PARENT") {
      throw new Error("Faqat ota-ona hisobi farzand qo'sha oladi.");
    }
    const { code } = (await req.json()) as { code?: string };
    if (!code?.trim()) throw new Error("Kodni kiriting.");

    const child = await prisma.user.findUnique({
      where: { claimCode: code.trim().toUpperCase() },
    });
    if (
      !child ||
      child.role !== "STUDENT" ||
      !child.claimCodeExpiresAt ||
      child.claimCodeExpiresAt < new Date()
    ) {
      throw new Error("Kod noto'g'ri yoki muddati o'tgan.");
    }
    if (child.id === parent.id) throw new Error("O'zingizni qo'sha olmaysiz.");

    const existing = await prisma.parentLink.findUnique({
      where: { parentId_childId: { parentId: parent.id, childId: child.id } },
    });
    if (existing) {
      throw new Error(
        existing.status === "APPROVED"
          ? "Bu farzand allaqachon biriktirilgan."
          : "So'rov allaqachon yuborilgan, tasdiqlanishini kuting.",
      );
    }

    await prisma.parentLink.create({
      data: { parentId: parent.id, childId: child.id, status: "PENDING" },
    });

    // Invalidate the one-time code.
    await prisma.user.update({
      where: { id: child.id },
      data: { claimCode: null, claimCodeExpiresAt: null },
    });

    // Notify the child over Telegram if linked (best-effort).
    if (process.env.TELEGRAM_BOT_TOKEN && child.telegramId) {
      const { sendMessage, launchButton, escapeHtml } = await import(
        "@/lib/telegram-bot"
      );
      await sendMessage(
        child.telegramId,
        `👪 <b>${escapeHtml(parent.fullName)}</b> sizning hisobingizga ota-ona sifatida ` +
          `bog'lanmoqchi.\n\nIlovani ochib so'rovni tasdiqlang yoki rad eting.`,
        launchButton("So'rovni ko'rish"),
      );
    }

    return { ok: true, childName: child.fullName };
  });
}
