import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'signal';

    const result = await query(
      `SELECT * FROM ${TABLES.tariffs} WHERE product_type = $1 AND is_active = true ORDER BY sort_order ASC`,
      [type]
    );

    const tariffs = result.rows.map((t: any) => ({
      id: t.id,
      name: t.name,
      durationMonths: t.duration_months,
      price: parseFloat(t.price),
      starsPrice: t.stars_price || parseFloat(t.price) * 50,
      isActive: t.is_active,
      productType: t.product_type,
    }));

    return NextResponse.json({ tariffs });
  } catch (error: any) {
    console.error('Failed to fetch tariffs:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
