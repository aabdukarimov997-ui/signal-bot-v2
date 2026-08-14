import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const settings = await db.siteSetting.findMany();
    const kv: Record<string, string> = {};
    for (const s of settings) {
      kv[s.key] = s.value;
    }
    return NextResponse.json(kv);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "settings object is required" },
        { status: 400 }
      );
    }

    const entries = Object.entries(settings);

    await Promise.all(
      entries.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    const updated = await db.siteSetting.findMany();
    const kv: Record<string, string> = {};
    for (const s of updated) {
      kv[s.key] = s.value;
    }

    return NextResponse.json(kv);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}