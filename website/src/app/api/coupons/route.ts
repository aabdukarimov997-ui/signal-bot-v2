import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const coupons = await db.coupon.findMany();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, discountPercent, validFrom, validTo, maxUses, isActive } =
      body;

    if (!code || !validTo) {
      return NextResponse.json(
        { error: "code and validTo are required" },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code,
        discountPercent: discountPercent ?? 0,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validTo: new Date(validTo),
        maxUses: maxUses ?? 100,
        usedCount: 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Failed to create coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (fields.code !== undefined) data.code = fields.code;
    if (fields.discountPercent !== undefined)
      data.discountPercent = fields.discountPercent;
    if (fields.validFrom !== undefined) data.validFrom = new Date(fields.validFrom);
    if (fields.validTo !== undefined) data.validTo = new Date(fields.validTo);
    if (fields.maxUses !== undefined) data.maxUses = fields.maxUses;
    if (fields.usedCount !== undefined) data.usedCount = fields.usedCount;
    if (fields.isActive !== undefined) data.isActive = fields.isActive;

    const coupon = await db.coupon.update({ where: { id }, data });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Failed to update coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}