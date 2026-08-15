import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createSessionToken,
  authCookieOptions,
  COOKIE_NAME,
} from "@/lib/auth";
import { query, TABLES } from "@/lib/tma/db";

export const runtime = "nodejs";

/**
 * Bot orqali admin panelga kirish.
 *
 * Bot admin'ga imzolangan bir martalik havola yuboradi:
 *   {SITE}/api/auth/bot?token=...
 *
 * Token: base64url({id, exp}) + "." + HMAC-SHA256(ADMIN_LOGIN_SECRET, payload)
 * Bot va sayt bir xil ADMIN_LOGIN_SECRET'ni ishlatadi.
 */

const SECRET = process.env.ADMIN_LOGIN_SECRET || "";

function verifyBotToken(token: string): { id: string } | null {
  if (!SECRET || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (!data.id || !data.exp) return null;
    if (Number(data.exp) * 1000 < Date.now()) return null; // muddati o'tgan
    return { id: String(data.id) };
  } catch {
    return null;
  }
}

async function getAdminIds(): Promise<string[]> {
  try {
    const res = await query(
      `SELECT value FROM ${TABLES.settings} WHERE key = 'admin_ids' LIMIT 1`
    );
    if (res.rows[0]) {
      const parsed = JSON.parse(res.rows[0].value);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch {
    // fallback
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";

    const data = verifyBotToken(token);
    if (!data) {
      return NextResponse.json(
        { error: "Yaroqsiz yoki muddati o'tgan havola. Botdan yangi havola oling." },
        { status: 401 }
      );
    }

    // Telegram ID adminlar ro'yxatida bo'lishi kerak
    const adminIds = await getAdminIds();
    if (!adminIds.includes(data.id)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    // Admin foydalanuvchini topamiz yoki yaratamiz (website.User)
    let user = await db.user.findFirst({
      where: { telegramId: data.id },
    });
    if (!user) {
      user = await db.user.create({
        data: {
          email: `admin_${data.id}@aaa-trading.academy`,
          name: "Admin",
          role: "ADMIN",
          telegramId: data.id,
        },
      });
    } else if (user.role !== "ADMIN") {
      user = await db.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    }

    // Sessiya cookie yaratamiz va admin panelga yo'naltiramiz.
    // Muhim: ichki Railway hostiga emas, jamoat URL'iga yo'naltiramiz.
    const sessionToken = createSessionToken();
    // Jamoat URL'iga yo'naltiramiz. NEXT_PUBLIC_SITE_URL boshqariladigan
    // sozlamadir (RAILWAY_PUBLIC_DOMAIN esa Railway tomonidan qo'yiladi va
    // eskirgan domen'ga ishora qilishi mumkin — masalan, is-a.dev o'chirilgan).
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      "https://aaa-abdulloh-8ecf.up.railway.app";
    const baseUrl = /^https?:\/\//.test(base) ? base : `https://${base}`;
    const response = NextResponse.redirect(
      new URL("/admin", baseUrl.replace(/\/$/, ""))
    );
    response.cookies.set(COOKIE_NAME, sessionToken, authCookieOptions());
    return response;
  } catch (error) {
    console.error("Bot login failed:", error);
    return NextResponse.json(
      { error: "Kirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
