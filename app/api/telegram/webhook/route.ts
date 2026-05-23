import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  escapeHtml,
  launchButton,
  sendMessage,
} from "@/lib/telegram-bot";
import {
  APPLICATION_STATUS_LABEL,
  formatDate,
  formatDateTime,
} from "@/lib/format";

type TgUpdate = {
  message?: {
    chat: { id: number };
    from?: { id: number; username?: string };
    text?: string;
  };
};

export async function POST(req: NextRequest) {
  // Verify Telegram's secret token (set when registering the webhook).
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    secret &&
    req.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return new NextResponse("forbidden", { status: 403 });
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = update.message;
  const text = msg?.text?.trim();
  const chatId = msg?.chat.id;
  const telegramId = msg?.from?.id ? String(msg.from.id) : null;

  if (!chatId || !text) return NextResponse.json({ ok: true });

  // Take only the command word (strip args / @botname).
  const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();

  try {
    switch (command) {
      case "/start":
        await sendMessage(
          chatId,
          "👋 <b>Bittada</b> — O'zbekiston xususiy universitetlariga yagona ariza platformasi.\n\n" +
            "Quyidagi tugma orqali ilovani oching va arizalaringizni boshqaring.\n\n" +
            "Buyruqlar:\n" +
            "/arizalarim — arizalar holati\n" +
            "/imtihonlarim — imtihonlar\n" +
            "/help — yordam",
          launchButton(),
        );
        break;

      case "/help":
        await sendMessage(
          chatId,
          "<b>Yordam</b>\n\n" +
            "• Ilovani ochish uchun pastdagi tugmani bosing.\n" +
            "• /arizalarim — arizalaringiz holatini ko'rish.\n" +
            "• /imtihonlarim — yozilgan imtihonlaringiz.\n\n" +
            "Savollar bo'lsa, ilova orqali murojaat qiling.",
          launchButton(),
        );
        break;

      case "/arizalarim":
        await handleMyApplications(chatId, telegramId);
        break;

      case "/imtihonlarim":
        await handleMyExams(chatId, telegramId);
        break;

      default:
        await sendMessage(
          chatId,
          "Tushunmadim 🤔. /help buyrug'ini yuboring yoki ilovani oching.",
          launchButton(),
        );
    }
  } catch (e) {
    console.error("webhook handler error:", e);
  }

  return NextResponse.json({ ok: true });
}

async function findStudent(telegramId: string | null) {
  if (!telegramId) return null;
  return prisma.user.findUnique({ where: { telegramId } });
}

async function handleMyApplications(chatId: number, telegramId: string | null) {
  const user = await findStudent(telegramId);
  if (!user) {
    await sendMessage(
      chatId,
      "Hisob topilmadi. Avval ilovani oching va ro'yxatdan o'ting.",
      launchButton(),
    );
    return;
  }

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      university: { select: { name: true, deadline: true } },
      major: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (apps.length === 0) {
    await sendMessage(
      chatId,
      "Sizda hali ariza yo'q. Ilovani ochib, universitet tanlang.",
      launchButton(),
    );
    return;
  }

  const lines = apps.map((a) => {
    const label = APPLICATION_STATUS_LABEL[a.status] || a.status;
    const emoji =
      a.status === "QABUL_QILINDI"
        ? "✅"
        : a.status === "RAD_ETILDI"
          ? "❌"
          : a.status === "KORIB_CHIQILMOQDA"
            ? "🔄"
            : "📝";
    return (
      `${emoji} <b>${escapeHtml(a.university.name)}</b>\n` +
      `   ${escapeHtml(a.major.name)} — ${escapeHtml(label)}\n` +
      `   Muddat: ${formatDate(a.university.deadline)}`
    );
  });

  await sendMessage(
    chatId,
    `<b>Sizning arizalaringiz (${apps.length})</b>\n\n${lines.join("\n\n")}`,
    launchButton("Arizalarni boshqarish"),
  );
}

async function handleMyExams(chatId: number, telegramId: string | null) {
  const user = await findStudent(telegramId);
  if (!user) {
    await sendMessage(
      chatId,
      "Hisob topilmadi. Avval ilovani oching va ro'yxatdan o'ting.",
      launchButton(),
    );
    return;
  }

  const regs = await prisma.examRegistration.findMany({
    where: { userId: user.id },
    include: {
      exam: { include: { university: { select: { name: true } } } },
    },
    orderBy: { exam: { date: "asc" } },
  });

  if (regs.length === 0) {
    await sendMessage(
      chatId,
      "Siz hali imtihonga yozilmagansiz.",
      launchButton("Imtihonlar"),
    );
    return;
  }

  const lines = regs.map(
    (r) =>
      `📅 <b>${escapeHtml(r.exam.university.name)}</b>\n` +
      `   ${formatDateTime(r.exam.date)}\n` +
      `   ${escapeHtml(r.exam.location)}`,
  );

  await sendMessage(
    chatId,
    `<b>Imtihonlaringiz (${regs.length})</b>\n\n${lines.join("\n\n")}`,
    launchButton(),
  );
}
