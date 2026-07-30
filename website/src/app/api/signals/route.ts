import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_SIGNAL = {
  id: "",
  name: "AT_analysis",
  description: "",
  monthlyPrice: 0,
  quarterlyPrice: 0,
  semiannualPrice: 0,
  monthlyFeatures: [],
  quarterlyFeatures: [],
  semiannualFeatures: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function parseFeatures(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const signal = await db.signal.findFirst({ where: { isActive: true } });

    if (!signal) {
      return NextResponse.json(DEFAULT_SIGNAL);
    }

    return NextResponse.json({
      ...signal,
      monthlyFeatures: parseFeatures(signal.monthlyFeatures),
      quarterlyFeatures: parseFeatures(signal.quarterlyFeatures),
      semiannualFeatures: parseFeatures(signal.semiannualFeatures),
    });
  } catch (error) {
    console.error("Failed to fetch signal:", error);
    return NextResponse.json(
      { error: "Failed to fetch signal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const adminSecret = request.headers.get("x-admin-secret");
    // For now, allow all requests. In production, check against ADMIN_SECRET env var.

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      // Create a new signal
      const signal = await db.signal.create({
        data: {
          name: fields.name ?? "AT_analysis",
          description: fields.description ?? "",
          monthlyPrice: fields.monthlyPrice ?? 0,
          quarterlyPrice: fields.quarterlyPrice ?? 0,
          semiannualPrice: fields.semiannualPrice ?? 0,
          monthlyFeatures:
            typeof fields.monthlyFeatures === "string"
              ? fields.monthlyFeatures
              : JSON.stringify(fields.monthlyFeatures ?? []),
          quarterlyFeatures:
            typeof fields.quarterlyFeatures === "string"
              ? fields.quarterlyFeatures
              : JSON.stringify(fields.quarterlyFeatures ?? []),
          semiannualFeatures:
            typeof fields.semiannualFeatures === "string"
              ? fields.semiannualFeatures
              : JSON.stringify(fields.semiannualFeatures ?? []),
          isActive: fields.isActive ?? true,
        },
      });

      return NextResponse.json({
        ...signal,
        monthlyFeatures: parseFeatures(signal.monthlyFeatures),
        quarterlyFeatures: parseFeatures(signal.quarterlyFeatures),
        semiannualFeatures: parseFeatures(signal.semiannualFeatures),
      });
    }

    // Update existing signal
    const data: Record<string, unknown> = {};
    if (fields.name !== undefined) data.name = fields.name;
    if (fields.description !== undefined) data.description = fields.description;
    if (fields.monthlyPrice !== undefined) data.monthlyPrice = fields.monthlyPrice;
    if (fields.quarterlyPrice !== undefined)
      data.quarterlyPrice = fields.quarterlyPrice;
    if (fields.semiannualPrice !== undefined)
      data.semiannualPrice = fields.semiannualPrice;
    if (fields.monthlyFeatures !== undefined) {
      data.monthlyFeatures =
        typeof fields.monthlyFeatures === "string"
          ? fields.monthlyFeatures
          : JSON.stringify(fields.monthlyFeatures);
    }
    if (fields.quarterlyFeatures !== undefined) {
      data.quarterlyFeatures =
        typeof fields.quarterlyFeatures === "string"
          ? fields.quarterlyFeatures
          : JSON.stringify(fields.quarterlyFeatures);
    }
    if (fields.semiannualFeatures !== undefined) {
      data.semiannualFeatures =
        typeof fields.semiannualFeatures === "string"
          ? fields.semiannualFeatures
          : JSON.stringify(fields.semiannualFeatures);
    }
    if (fields.isActive !== undefined) data.isActive = fields.isActive;

    const signal = await db.signal.update({ where: { id }, data });

    return NextResponse.json({
      ...signal,
      monthlyFeatures: parseFeatures(signal.monthlyFeatures),
      quarterlyFeatures: parseFeatures(signal.quarterlyFeatures),
      semiannualFeatures: parseFeatures(signal.semiannualFeatures),
    });
  } catch (error) {
    console.error("Failed to update signal:", error);
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    );
  }
}