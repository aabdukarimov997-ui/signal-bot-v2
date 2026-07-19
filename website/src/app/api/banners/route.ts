import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const banners = await db.banner.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, imageUrl, link, isActive, order } = body;

    const banner = await db.banner.create({
      data: {
        title: title ?? "",
        subtitle: subtitle ?? "",
        imageUrl: imageUrl ?? "",
        link: link ?? "",
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Failed to create banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
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
    if (fields.title !== undefined) data.title = fields.title;
    if (fields.subtitle !== undefined) data.subtitle = fields.subtitle;
    if (fields.imageUrl !== undefined) data.imageUrl = fields.imageUrl;
    if (fields.link !== undefined) data.link = fields.link;
    if (fields.isActive !== undefined) data.isActive = fields.isActive;
    if (fields.order !== undefined) data.order = fields.order;

    const banner = await db.banner.update({ where: { id }, data });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Failed to update banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
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

    await db.banner.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}