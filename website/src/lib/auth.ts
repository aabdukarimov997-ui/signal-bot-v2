import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Xavfsiz autentifikatsiya moduli.
 *
 * - Parol kodda emas, .env faylida saqlanadi (ADMIN_PASSWORD)
 * - Sessiya: HMAC-SHA256 bilan imzolangan httpOnly cookie
 * - Brute-force himoyasi: IP bo'yicha urinishlar cheklangan
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aaa-trading.academy";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const AUTH_SECRET = process.env.AUTH_SECRET || "";
const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 kun
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // soniyalarda

// ─── Credentials ───────────────────────────────────────────────────

export function verifyCredentials(email: string, password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const okEmail =
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const okPass =
    typeof password === "string" && password.length > 0 && password === ADMIN_PASSWORD;
  return okEmail && okPass;
}

// ─── Session tokens ────────────────────────────────────────────────

function sign(value: string): string {
  return createHmac("sha256", AUTH_SECRET).update(value).digest("hex");
}

export function createSessionToken(): string {
  const payload = String(Date.now() + SESSION_TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): boolean {
  if (!AUTH_SECRET || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  const exp = parseInt(payload, 10);
  return Number.isFinite(exp) && exp > Date.now();
}

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export function isAdmin(request: Request): boolean {
  const token = getSessionToken(request);
  return token ? verifySessionToken(token) : false;
}

/** Himoyalangan API uchun: agar admin bo'lmasa 401 qaytaradi. */
export function requireAdmin(request: Request): NextResponse | null {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export { COOKIE_NAME, COOKIE_MAX_AGE };

// ─── Rate limiting (brute-force himoyasi) ──────────────────────────

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 daqiqa
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

/** IP bo'yicha login urinishlarini cheklaydi. ruxsat bo'lsa true. */
export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return false;
  }
  return true;
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
