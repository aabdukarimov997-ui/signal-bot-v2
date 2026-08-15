import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* Abdulloh trader — YouTube kanal ID (env orqali o'zgartirish mumkin) */
const CHANNEL_ID =
  process.env.YOUTUBE_CHANNEL_ID || "UCSffz5ISxPuGe2AVg_R5OlQ";

export interface Video {
  id: string;
  title: string;
  published: string;
  views: number;
  thumbnail: string;
}

/* YouTube'ga har safar urilmasligi uchun 10 daqiqalik in-memory cache */
let cache: { at: number; data: Video[] } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchVideos(): Promise<Video[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`YouTube feed: HTTP ${res.status}`);
  }
  const xml = await res.text();

  const videos: Video[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null) {
    const e = m[1];
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(e)?.[1];
    const title = /<title>([\s\S]*?)<\/title>/.exec(e)?.[1];
    const published = /<published>([^<]+)<\/published>/.exec(e)?.[1];
    const views = /<media:statistics views="(\d+)"/.exec(e)?.[1];
    if (!id || !title) continue;
    videos.push({
      id,
      title: decodeEntities(title.trim()),
      published: published || "",
      views: views ? parseInt(views, 10) : 0,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }
  return videos;
}

export async function GET() {
  const now = Date.now();
  if (!cache || now - cache.at > CACHE_TTL_MS) {
    try {
      cache = { at: now, data: await fetchVideos() };
    } catch (error) {
      console.error("Failed to fetch YouTube videos:", error);
      return NextResponse.json(
        { videos: [], error: "YouTube videolarini yuklab bo'lmadi" },
        { status: 502 }
      );
    }
  }
  return NextResponse.json({ videos: cache.data });
}
