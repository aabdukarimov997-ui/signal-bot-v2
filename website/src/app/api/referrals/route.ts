import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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