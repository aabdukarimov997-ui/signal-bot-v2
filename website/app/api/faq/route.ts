import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, category, order } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer are required" },
        { status: 400 }
      );
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category: category ?? "general",
        order: order ?? 0,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
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
    if (fields.question !== undefined) data.question = fields.question;
    if (fields.answer !== undefined) data.answer = fields.answer;
    if (fields.category !== undefined) data.category = fields.category;
    if (fields.order !== undefined) data.order = fields.order;

    const faq = await db.fAQ.update({ where: { id }, data });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
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

    await db.fAQ.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}