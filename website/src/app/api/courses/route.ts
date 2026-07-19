import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_COURSE = {
  id: "",
  name: "Trading Haqiqati",
  description: "",
  starterPrice: 0,
  professionalPrice: 0,
  masterPrice: 0,
  starterFeatures: [],
  professionalFeatures: [],
  masterFeatures: [],
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
    const course = await db.course.findFirst({ where: { isActive: true } });

    if (!course) {
      return NextResponse.json(DEFAULT_COURSE);
    }

    return NextResponse.json({
      ...course,
      starterFeatures: parseFeatures(course.starterFeatures),
      professionalFeatures: parseFeatures(course.professionalFeatures),
      masterFeatures: parseFeatures(course.masterFeatures),
    });
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const adminSecret = request.headers.get("x-admin-secret");
    // For now, allow all requests. In production, check against ADMIN_SECRET env var.
    // if (adminSecret !== process.env.ADMIN_SECRET) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      // Create a new course
      const course = await db.course.create({
        data: {
          name: fields.name ?? "Trading Haqiqati",
          description: fields.description ?? "",
          starterPrice: fields.starterPrice ?? 0,
          professionalPrice: fields.professionalPrice ?? 0,
          masterPrice: fields.masterPrice ?? 0,
          starterFeatures:
            typeof fields.starterFeatures === "string"
              ? fields.starterFeatures
              : JSON.stringify(fields.starterFeatures ?? []),
          professionalFeatures:
            typeof fields.professionalFeatures === "string"
              ? fields.professionalFeatures
              : JSON.stringify(fields.professionalFeatures ?? []),
          masterFeatures:
            typeof fields.masterFeatures === "string"
              ? fields.masterFeatures
              : JSON.stringify(fields.masterFeatures ?? []),
          isActive: fields.isActive ?? true,
        },
      });

      return NextResponse.json({
        ...course,
        starterFeatures: parseFeatures(course.starterFeatures),
        professionalFeatures: parseFeatures(course.professionalFeatures),
        masterFeatures: parseFeatures(course.masterFeatures),
      });
    }

    // Update existing course
    const data: Record<string, unknown> = {};
    if (fields.name !== undefined) data.name = fields.name;
    if (fields.description !== undefined) data.description = fields.description;
    if (fields.starterPrice !== undefined) data.starterPrice = fields.starterPrice;
    if (fields.professionalPrice !== undefined)
      data.professionalPrice = fields.professionalPrice;
    if (fields.masterPrice !== undefined) data.masterPrice = fields.masterPrice;
    if (fields.starterFeatures !== undefined) {
      data.starterFeatures =
        typeof fields.starterFeatures === "string"
          ? fields.starterFeatures
          : JSON.stringify(fields.starterFeatures);
    }
    if (fields.professionalFeatures !== undefined) {
      data.professionalFeatures =
        typeof fields.professionalFeatures === "string"
          ? fields.professionalFeatures
          : JSON.stringify(fields.professionalFeatures);
    }
    if (fields.masterFeatures !== undefined) {
      data.masterFeatures =
        typeof fields.masterFeatures === "string"
          ? fields.masterFeatures
          : JSON.stringify(fields.masterFeatures);
    }
    if (fields.isActive !== undefined) data.isActive = fields.isActive;

    const course = await db.course.update({ where: { id }, data });

    return NextResponse.json({
      ...course,
      starterFeatures: parseFeatures(course.starterFeatures),
      professionalFeatures: parseFeatures(course.professionalFeatures),
      masterFeatures: parseFeatures(course.masterFeatures),
    });
  } catch (error) {
    console.error("Failed to update course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}