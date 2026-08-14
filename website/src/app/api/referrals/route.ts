import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const referrals = await db.referral.findMany({
      include: {
        referrer: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        referred: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Failed to fetch referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}