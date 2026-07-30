import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      whereClause += ` AND p.status = $${params.length}`;
    }

    // Total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.payments} p ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0]?.count || '0');

    // Fetch payments with user data
    const paymentsResult = await query(
      `SELECT p.*, u.full_name, u.username, u.telegram_id
       FROM ${TABLES.payments} p
       LEFT JOIN ${TABLES.users} u ON p.user_id = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      payments: paymentsResult.rows,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    console.error('Bot payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', message: error?.message },
      { status: 500 }
    );
  }
}
