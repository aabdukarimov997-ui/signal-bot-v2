import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyCredentials,
  createSessionToken,
  isAdmin,
  checkLoginRateLimit,
  getClientIp,
  authCookieOptions,
  COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Brute-force himoyasi: IP bo'yicha urinishlar cheklangan
    const ip = getClientIp(request);
    if (!checkLoginRateLimit(ip)) {
      return NextResponse.json(
        { error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    // Parol endi .env faylidan tekshiriladi (kodda emas!)
    if (!verifyCredentials(email, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        telegramId: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          name: "Admin",
          role: "ADMIN",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          telegramId: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Yaroqli admin — imzolangan sessiya cookie yaratamiz
    const token = createSessionToken();
    const response = NextResponse.json({
      user,
      authenticated: true,
    });

    response.cookies.set(COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("Failed to authenticate:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authenticated = isAdmin(request);
    if (!authenticated) {
      return NextResponse.json({ authenticated: false });
    }

    // Sessiyadan foydalanuvchini topish — cookie ichida email emas,
    // token faqat sessiyani tasdiqlaydi. Demo uchun admin email qaytaramiz.
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Failed to check session:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(COOKIE_NAME, "", {
    ...authCookieOptions(),
    maxAge: 0,
  });
  return response;
}
