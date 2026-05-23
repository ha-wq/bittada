import { NextRequest } from "next/server";
import { handle } from "@/lib/api";
import { prisma } from "@/lib/db";
import { createSession, getCurrentUser } from "@/lib/session";
import { verifyTelegramInitData } from "@/lib/telegram";

// Telegram Mini App login.
// Body: { initData: string } — the raw initData string from
// window.Telegram.WebApp.initData.
//
// Behaviour (dual auth):
//  - If a session already exists (e.g. user just logged in via email) and
//    that account has no Telegram link yet → link this Telegram id to it.
//  - Else if a user with this telegramId exists → log them in.
//  - Else create a brand-new STUDENT account tied to this Telegram id.
export async function POST(req: NextRequest) {
  return handle(async () => {
    const { initData } = (await req.json()) as { initData?: string };
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN sozlanmagan.");

    const verified = verifyTelegramInitData(initData || "", token);
    if (!verified) throw new Error("Telegram ma'lumotlari tasdiqlanmadi.");

    const tg = verified.user;
    const telegramId = String(tg.id);
    const displayName =
      [tg.first_name, tg.last_name].filter(Boolean).join(" ").trim() ||
      tg.username ||
      "Telegram foydalanuvchisi";

    // 1) Link to an already-signed-in account that isn't linked yet.
    const current = await getCurrentUser();
    if (current && !current.telegramId) {
      const taken = await prisma.user.findUnique({ where: { telegramId } });
      if (!taken) {
        const linked = await prisma.user.update({
          where: { id: current.id },
          data: { telegramId, telegramUsername: tg.username ?? null },
        });
        return serialize(linked, "linked");
      }
    }

    // 2) Existing Telegram user → log in.
    const existing = await prisma.user.findUnique({ where: { telegramId } });
    if (existing) {
      // keep username fresh
      if (existing.telegramUsername !== (tg.username ?? null)) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { telegramUsername: tg.username ?? null },
        });
      }
      await createSession(existing.id);
      return serialize(existing, "login");
    }

    // 3) New Telegram-only student.
    const created = await prisma.user.create({
      data: {
        telegramId,
        telegramUsername: tg.username ?? null,
        fullName: displayName,
        role: "STUDENT",
        profile: { create: {} },
      },
    });
    await createSession(created.id);
    return serialize(created, "registered");
  });
}

function serialize(
  user: {
    id: string;
    fullName: string;
    email: string | null;
    role: string;
    telegramUsername: string | null;
  },
  outcome: "login" | "registered" | "linked",
) {
  return {
    outcome,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      telegramUsername: user.telegramUsername,
    },
  };
}
