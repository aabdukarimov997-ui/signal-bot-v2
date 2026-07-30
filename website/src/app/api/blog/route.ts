import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const all = searchParams.get("all") === "true";

    if (slug) {
      const post = await db.blogPost.findUnique({
        where: { slug },
        include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
      });

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json(post);
    }

    const posts = await db.blogPost.findMany({
      where: all ? {} : { published: true },
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, published, authorId } =
      body;

    if (!title || !slug || !authorId) {
      return NextResponse.json(
        { error: "title, slug, and authorId are required" },
        { status: 400 }
      );
    }

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        content: content ?? "",
        excerpt: excerpt ?? "",
        coverImage: coverImage ?? "",
        published: published ?? false,
        authorId,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
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
    if (fields.slug !== undefined) data.slug = fields.slug;
    if (fields.content !== undefined) data.content = fields.content;
    if (fields.excerpt !== undefined) data.excerpt = fields.excerpt;
    if (fields.coverImage !== undefined) data.coverImage = fields.coverImage;
    if (fields.published !== undefined) data.published = fields.published;
    if (fields.authorId !== undefined) data.authorId = fields.authorId;

    const post = await db.blogPost.update({ where: { id }, data });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
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

    await db.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}