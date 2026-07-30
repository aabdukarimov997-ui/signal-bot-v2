import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalUsers, totalPayments, paymentsCompleted, analyticsEvents] =
      await Promise.all([
        db.user.count(),
        db.payment.count(),
        db.payment.aggregate({
          _sum: { amount: true },
          where: { status: "COMPLETED" },
        }),
        db.analyticsEvent.groupBy({
          by: ["eventType"],
          _count: { id: true },
        }),
      ]);

    const revenue = paymentsCompleted._sum.amount ?? 0;

    const pageViewsByType: Record<string, number> = {};
    for (const event of analyticsEvents) {
      pageViewsByType[event.eventType] = event._count.id;
    }

    return NextResponse.json({
      totalUsers,
      totalPayments,
      revenue,
      pageViewsByType,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, eventData, ipAddress } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    const event = await db.analyticsEvent.create({
      data: {
        eventType,
        eventData: eventData ? JSON.stringify(eventData) : "{}",
        ipAddress: ipAddress ?? "",
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create analytics event:", error);
    return NextResponse.json(
      { error: "Failed to create analytics event" },
      { status: 500 }
    );
  }
}