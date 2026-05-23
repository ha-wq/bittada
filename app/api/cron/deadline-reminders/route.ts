import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { escapeHtml, launchButton, sendMessage } from "@/lib/telegram-bot";
import { formatDate } from "@/lib/format";

// Days-before thresholds at which we remind students about a deadline.
const THRESHOLDS = [3, 1];
const DAY_MS = 24 * 60 * 60 * 1000;

// Trigger daily via cron, e.g.:
//   curl -s "https://yourdomain/api/cron/deadline-reminders?secret=XXX"
// Sends a reminder for each not-yet-submitted application whose university
// deadline is exactly 3 or 1 days away. Deduped via NotificationLog.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.nextUrl.searchParams.get("secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) {
    return new NextResponse("forbidden", { status: 403 });
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "bot token missing" }, { status: 500 });
  }

  const now = Date.now();
  const maxDeadline = new Date(now + (Math.max(...THRESHOLDS) + 1) * DAY_MS);

  // Drafts (not yet submitted) whose university deadline is approaching,
  // for students who have a linked Telegram account.
  const apps = await prisma.application.findMany({
    where: {
      status: "YUBORILMAGAN",
      university: { deadline: { gte: new Date(now), lte: maxDeadline } },
      user: { telegramId: { not: null } },
    },
    include: {
      user: { select: { telegramId: true } },
      university: { select: { name: true, deadline: true } },
      major: { select: { name: true } },
    },
  });

  let sent = 0;
  for (const a of apps) {
    const chatId = a.user.telegramId;
    if (!chatId) continue;

    const daysLeft = Math.ceil(
      (a.university.deadline.getTime() - now) / DAY_MS,
    );
    if (!THRESHOLDS.includes(daysLeft)) continue;

    const refId = `${a.id}:${daysLeft}`;
    // Atomic dedupe: the unique (kind, refId) index prevents double sends.
    try {
      await prisma.notificationLog.create({
        data: { kind: "deadline", refId },
      });
    } catch {
      continue; // already sent this reminder
    }

    const text =
      `⏰ <b>Muddat yaqinlashmoqda</b>\n\n` +
      `<b>${escapeHtml(a.university.name)}</b>\n` +
      `${escapeHtml(a.major.name)}\n\n` +
      `Topshirish muddati: <b>${formatDate(a.university.deadline)}</b> ` +
      `(${daysLeft} kun qoldi)\n\n` +
      `Arizangiz hali yuborilmagan. Ilovani ochib yuboring.`;

    await sendMessage(chatId, text, launchButton("Hozir yuborish"));
    sent += 1;
  }

  return NextResponse.json({ ok: true, scanned: apps.length, sent });
}
