import "server-only";
import { prisma } from "./db";
import { APPLICATION_STATUS_LABEL } from "./format";

const API = "https://api.telegram.org";

function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN sozlanmagan.");
  return t;
}

/** The HTTPS URL where the Mini App is served (used by launch buttons). */
export function webAppUrl() {
  return process.env.TELEGRAM_WEBAPP_URL || "";
}

type ReplyMarkup = {
  inline_keyboard: Array<
    Array<
      | { text: string; web_app: { url: string } }
      | { text: string; url: string }
      | { text: string; callback_data: string }
    >
  >;
};

export async function callTelegram<T = unknown>(
  method: string,
  payload: Record<string, unknown>,
): Promise<T | null> {
  try {
    const res = await fetch(`${API}/bot${token()}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`Telegram ${method} failed:`, data.description);
      return null;
    }
    return data.result as T;
  } catch (e) {
    console.error(`Telegram ${method} error:`, e);
    return null;
  }
}

export function sendMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: ReplyMarkup,
) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

/** Inline keyboard with a single "open the Mini App" web_app button. */
export function launchButton(text = "📝 Ariza topshirish"): ReplyMarkup | undefined {
  const url = webAppUrl();
  if (!url) return undefined;
  return { inline_keyboard: [[{ text, web_app: { url } }]] };
}

// ─── Notifications ──────────────────────────────────────────────

/**
 * Notify a student (by their stored telegramId) that an application's status
 * changed. Fire-and-forget: never throws into the caller.
 */
export async function notifyApplicationStatus(applicationId: string) {
  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: { select: { telegramId: true } },
        university: { select: { name: true } },
        major: { select: { name: true } },
      },
    });
    const chatId = app?.user.telegramId;
    if (!app || !chatId) return;

    const label = APPLICATION_STATUS_LABEL[app.status] || app.status;
    const emoji =
      app.status === "QABUL_QILINDI"
        ? "✅"
        : app.status === "RAD_ETILDI"
          ? "❌"
          : "🔄";

    const text =
      `${emoji} <b>Ariza holati yangilandi</b>\n\n` +
      `<b>${escapeHtml(app.university.name)}</b>\n` +
      `${escapeHtml(app.major.name)}\n\n` +
      `Yangi holat: <b>${escapeHtml(label)}</b>`;

    await sendMessage(chatId, text, launchButton("Arizani ko'rish"));
  } catch (e) {
    console.error("notifyApplicationStatus error:", e);
  }
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
