import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = `WHERE (u.full_name ILIKE $1 OR u.username ILIKE $1 OR CAST(u.telegram_id AS TEXT) ILIKE $1)`;
      params.push(`%${search}%`);
    }

    // Total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.users} u ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0]?.count || '0');

    // Fetch users with latest subscription info
    const usersResult = await query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM ${TABLES.subscriptions} WHERE user_id = u.id AND status = 'active') as active_subs,
        (SELECT COUNT(*) FROM ${TABLES.payments} WHERE user_id = u.id) as total_payments,
        (SELECT COALESCE(SUM(amount::numeric), 0) FROM ${TABLES.payments} WHERE user_id = u.id AND status = 'approved') as total_spent
       FROM ${TABLES.users} u
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      users: usersResult.rows,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    console.error('Bot users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', message: error?.message },
      { status: 500 }
    );
  }
}
