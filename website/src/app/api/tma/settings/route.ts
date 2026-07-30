import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET() {
  try {
    const result = await query(`SELECT * FROM ${TABLES.settings}`);
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
