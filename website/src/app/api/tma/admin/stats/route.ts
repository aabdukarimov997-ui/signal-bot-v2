import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { requireAdmin, getInitDataFromRequest } from '@/lib/tma/verify';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(getInitDataFromRequest(request));
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Total users
    const usersResult = await query(`SELECT COUNT(*) as count FROM ${TABLES.users}`);
    const totalUsers = parseInt(usersResult.rows[0]?.count || '0');

    // Active subscriptions
    const subsResult = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.subscriptions} WHERE status = 'active'`
    );
    const activeSubs = parseInt(subsResult.rows[0]?.count || '0');

    // Total revenue (approved payments)
    const revenueResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM ${TABLES.payments} WHERE status = 'approved'`
    );
    const totalRevenue = parseFloat(revenueResult.rows[0]?.total || '0');

    // Today's revenue
    const todayRevenueResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM ${TABLES.payments} 
       WHERE status = 'approved' AND created_at::date = CURRENT_DATE`
    );
    const todayRevenue = parseFloat(todayRevenueResult.rows[0]?.total || '0');

    // Pending payments
    const pendingResult = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.payments} WHERE status = 'pending'`
    );
    const pendingPayments = parseInt(pendingResult.rows[0]?.count || '0');

    // Total referrals
    const refResult = await query(`SELECT COUNT(*) as count FROM ${TABLES.referralStats}`);
    const totalReferrals = parseInt(refResult.rows[0]?.count || '0');

    return NextResponse.json({
      totalUsers,
      activeSubscriptions: activeSubs,
      totalRevenue,
      todayRevenue,
      pendingPayments,
      totalReferrals,
    });
  } catch (error: any) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
