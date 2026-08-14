import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const result = await query(
      `SELECT s.*, t.name as tariff_name, t.product_type as tariff_product_type
       FROM ${TABLES.subscriptions} s 
       JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id 
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.end_date DESC LIMIT 1`,
      [userId]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ subscription: null });
    }

    const s = result.rows[0];
    const now = new Date();
    const end = new Date(s.end_date);
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return NextResponse.json({
      subscription: {
        id: s.id,
        tariffId: s.tariff_id,
        tariffName: s.tariff_name,
        status: s.status,
        startDate: s.start_date,
        endDate: s.end_date,
        inviteLink: s.invite_link,
        productType: s.product_type ?? s.tariff_product_type,
        daysLeft,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
