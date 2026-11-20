import { createHmac, timingSafeEqual } from "crypto";
import { query, TABLES, type BotUser } from "./db";

/**
 * Telegram WebApp initData ni server tomonda tekshirish.
 *
 * Telegram tomonidan yuborilgan initData imzolanmagan va soxtalashtirilishi mumkin,
 * shuning uchun har bir so'rovda HMAC-SHA256 orqali tekshirish SHART.
 *
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export interface VerifiedInitData {
  telegramId: string;
  firstName: string;
  username: string;
  languageCode: string;
  authDate: number;
  hash: string;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyInitData(initData: string): VerifiedInitData | null {
  const token = process.env.BOT_TOKEN;
  if (!token || !initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  // data_check_string: kalitlar bo'yicha saralangan "key=value" qatorlar, \n bilan
  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== "signature")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
  const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
  const calculated = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!safeEqual(calculated, hash)) return null;

  let user: any = null;
  try {
    user = JSON.parse(params.get("user") || "null");
  } catch {
    return null;
  }
  if (!user || user.id == null) return null;

  const authDate = parseInt(params.get("auth_date") || "0", 10);
  return {
    telegramId: String(user.id),
    firstName: user.first_name || user.last_name || "User",
    username: user.username || "",
    languageCode: user.language_code || "uz",
    authDate,
    hash,
  };
}

/**
 * initData dan autentifikatsiya qilingan bot foydalanuvchisini topadi (yoki 401).
 * Client yuborgan userId'ga ISHONMAYDI — identifikatsiya initData dan olinadi.
 */
export async function getAuthenticatedUser(
  initData: string | null,
): Promise<{ user: BotUser } | { error: string; status: number }> {
  if (!initData) {
    return { error: "initData required", status: 401 };
  }
  const verified = verifyInitData(initData);
  if (!verified) {
    return { error: "Invalid initData", status: 401 };
  }

  const result = await query(
    `SELECT * FROM ${TABLES.users} WHERE telegram_id = $1 LIMIT 1`,
    [verified.telegramId]
  );
  const user = result.rows[0];
  if (!user) {
    return { error: "User not found", status: 404 };
  }
  if (user.is_banned) {
    return { error: "Banned", status: 403 };
  }
  return { user };
}

/** Request'dan initData ni oladi (header: x-telegram-init-data). */
export function getInitDataFromRequest(request: Request): string {
  return request.headers.get("x-telegram-init-data") || "";
}

/** Admin telegram IDlar ro'yxatini DB settings'dan oladi. */
export async function getAdminIds(): Promise<string[]> {
  try {
    const res = await query(
      `SELECT value FROM ${TABLES.settings} WHERE key = 'admin_ids' LIMIT 1`
    );
    if (res.rows[0]) {
      const parsed = JSON.parse(res.rows[0].value);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Admin foydalanuvchini tekshiradi (initData imzosi + admin_ids).
 * Admin bo'lmasa yoki initData yaroqsiz bo'lsa xato qaytaradi.
 */
export async function requireAdmin(
  initData: string | null,
): Promise<{ user: BotUser; telegramId: string } | { error: string; status: number }> {
  const auth = await getAuthenticatedUser(initData);
  if ("error" in auth) return auth;

  const verified = verifyInitData(initData || "");
  if (!verified) {
    return { error: "Invalid initData", status: 401 };
  }
  const adminIds = await getAdminIds();
  if (!adminIds.includes(verified.telegramId)) {
    return { error: "Ruxsat yo'q", status: 403 };
  }
  return { user: auth.user, telegramId: verified.telegramId };
}