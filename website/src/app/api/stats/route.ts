import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/* Bosh sahifa reklamasidagi raqamlar — admin panel orqali o'zgartiriladi.
   Default qiymatlar: DB'da yozuv bo'lmasa ishlatiladi. */
export const DEFAULT_STATS = {
  stat_students: "230+",
  stat_experience: "5 yillik",
  stat_signals: "5000+",
} as const;

export type StatsKeys = keyof typeof DEFAULT_STATS;

export async function GET() {
  try {
    const rows = await db.siteSetting.findMany({
      where: { key: { in: Object.keys(DEFAULT_STATS) } },
    });
    const kv: Record<string, string> = { ...DEFAULT_STATS };
    for (const r of rows) {
      if (r.value) kv[r.key] = r.value;
    }
    return NextResponse.json(kv);
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    // DB muammosi bo'lsa ham sayt ishlashi uchun default'lar qaytadi
    return NextResponse.json({ ...DEFAULT_STATS });
  }
}
