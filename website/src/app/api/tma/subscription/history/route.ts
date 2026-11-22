import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { getAuthenticatedUser, getInitDataFromRequest } from '@/lib/tma/verify';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(getInitDataFromRequest(request));
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const userId = auth.user.id;

    const result = await query(
      `SELECT s.*, t.name as tariff_name
       FROM ${TABLES.subscriptions} s
       LEFT JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id
       WHERE s.user_id = $1
       ORDER BY s.end_date DESC LIMIT 20`,
      [userId]
    );

    const now = new Date();
    const history = result.rows.map((s: any) => {
      const end = new Date(s.end_date);
      return {
        id: s.id,
        tariffName: s.tariff_name || 'Signal',
        status: s.status,
        startDate: s.start_date,
        endDate: s.end_date,
        daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      };
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('Failed to fetch subscription history:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
