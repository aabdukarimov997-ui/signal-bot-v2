import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET() {
  try {
    // Total bot users
    const totalUsers = await query(`SELECT COUNT(*) as count FROM ${TABLES.users}`);
    const totalUsersCount = parseInt(totalUsers.rows[0]?.count || '0');

    // Active subscriptions
    const activeSubs = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.subscriptions} WHERE status = 'active'`
    );
    const activeSubsCount = parseInt(activeSubs.rows[0]?.count || '0');

    // Today's new users
    const todayUsers = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.users} WHERE created_at::date = CURRENT_DATE`
    );
    const todayUsersCount = parseInt(todayUsers.rows[0]?.count || '0');

    // Today's new subscriptions
    const todaySubs = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.subscriptions} WHERE start_date::date = CURRENT_DATE`
    );
    const todaySubsCount = parseInt(todaySubs.rows[0]?.count || '0');

    // Total revenue (approved payments)
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(amount::numeric), 0) as total FROM ${TABLES.payments} WHERE status = 'approved'`
    );
    const totalRevenueAmount = parseFloat(totalRevenue.rows[0]?.total || '0');

    // This month's revenue
    const monthRevenue = await query(
      `SELECT COALESCE(SUM(amount::numeric), 0) as total FROM ${TABLES.payments} 
       WHERE status = 'approved' AND created_at >= date_trunc('month', CURRENT_DATE)`
    );
    const monthRevenueAmount = parseFloat(monthRevenue.rows[0]?.total || '0');

    // Pending payments count
    const pendingPayments = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.payments} WHERE status = 'pending'`
    );
    const pendingPaymentsCount = parseInt(pendingPayments.rows[0]?.count || '0');

    // Subscription by product type
    const subsByType = await query(
      `SELECT product_type, COUNT(*) as count FROM ${TABLES.subscriptions} WHERE status = 'active' GROUP BY product_type`
    );

    // Payments by method
    const paymentsByMethod = await query(
      `SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount::numeric), 0) as total 
       FROM ${TABLES.payments} WHERE status = 'approved' GROUP BY payment_method`
    );

    return NextResponse.json({
      totalUsers: totalUsersCount,
      activeSubscriptions: activeSubsCount,
      todayNewUsers: todayUsersCount,
      todayNewSubscriptions: todaySubsCount,
      totalRevenue: totalRevenueAmount,
      monthlyRevenue: monthRevenueAmount,
      pendingPayments: pendingPaymentsCount,
      subscriptionsByType: subsByType.rows,
      paymentsByMethod: paymentsByMethod.rows,
    });
  } catch (error: any) {
    console.error('Bot stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot statistics', message: error?.message },
      { status: 500 }
    );
  }
}
