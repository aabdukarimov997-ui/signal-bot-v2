import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get("unread");

    const messages = await db.contactMessage.findMany({
      where: unread === "true" ? { isRead: false } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const contactMessage = await db.contactMessage.create({
      data: { name, email, subject, message, isRead: false },
    });

    return NextResponse.json(contactMessage, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return NextResponse.json(
      { error: "Failed to create contact message" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(contactMessage);
  } catch (error) {
    console.error("Failed to update contact message:", error);
    return NextResponse.json(
      { error: "Failed to update contact message" },
      { status: 500 }
    );
  }
}