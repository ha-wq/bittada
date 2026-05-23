import "server-only";
import { createHmac } from "crypto";

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type VerifiedInitData = {
  user: TelegramUser;
  authDate: number;
  raw: string;
};

// Telegram Mini App initData verification.
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//
// secret_key = HMAC_SHA256(key="WebAppData", message=bot_token)
// expected_hash = HMAC_SHA256(key=secret_key, message=data_check_string)
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 24 * 60 * 60,
): VerifiedInitData | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  // Build the data-check-string from all fields except `hash` and `signature`,
  // sorted by key. (`signature` is used for Telegram's separate Ed25519
  // third-party check and must NOT be part of the HMAC data-check-string.)
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key === "hash" || key === "signature") return;
    pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  // Reject stale payloads to limit replay.
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate) return null;
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
  if (!user?.id) return null;

  return { user, authDate, raw: initData };
}
