import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    // Demo authentication: password "aaa2024" with "admin" in email → ADMIN
    const isAdmin = email.toLowerCase().includes("admin");
    const isValidPassword = password === "aaa2024";

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
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
          email,
          name: isAdmin ? "Admin" : email.split("@")[0],
          role: isAdmin ? "ADMIN" : "USER",
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

    return NextResponse.json({
      user,
      authenticated: true,
    });
  } catch (error) {
    console.error("Failed to authenticate:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // No real session management — return unauthenticated state
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("Failed to check session:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}