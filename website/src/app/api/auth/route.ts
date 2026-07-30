import { NextResponse } from "next/server";

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

    // Authentication: login "abdullohaaa" → ADMIN role
    const isAdmin = email.toLowerCase() === "abdullohaaa";
    const isValidPassword = password === "kajiROQdLIIeUREMS0s";

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user without DB query — auth is credential-based
    const user = {
      id: isAdmin ? "admin-001" : `user-${Date.now()}`,
      email,
      name: isAdmin ? "Admin" : email.split("@")[0],
      role: isAdmin ? "ADMIN" : "USER",
      telegramId: null,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("Failed to check session:", error);
    return NextResponse.json(
      { error: "Failed to check session" },
      { status: 500 }
    );
  }
}
