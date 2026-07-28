import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT p.*, u.full_name as user_name, u.telegram_id as user_telegram_id, t.name as tariff_name
       FROM ${TABLES.payments} p
       LEFT JOIN ${TABLES.users} u ON p.user_id = u.id
       LEFT JOIN ${TABLES.tariffs} t ON p.product_id = t.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at DESC`
    );

    const payments = result.rows.map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      productType: p.product_type,
      amount: parseFloat(p.amount),
      currency: p.currency,
      paymentMethod: p.payment_method,
      status: p.status,
      photoFileId: p.photo_file_id,
      createdAt: p.created_at,
      userName: p.user_name,
      userTelegramId: p.user_telegram_id,
      tariffName: p.tariff_name,
    }));

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Failed to fetch admin payments:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { paymentId, action, adminTelegramId } = await request.json();
    
    if (!paymentId || !action) {
      return NextResponse.json({ error: 'paymentId and action required' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get payment details
      const paymentResult = await query(
        `SELECT * FROM ${TABLES.payments} WHERE id = $1 LIMIT 1`,
        [paymentId]
      );
      const payment = paymentResult.rows[0];
      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Get tariff
      const tariffResult = await query(
        `SELECT * FROM ${TABLES.tariffs} WHERE id = $1 LIMIT 1`,
        [payment.product_id]
      );
      const tariff = tariffResult.rows[0];

      // Get user referral bonus
      const userResult = await query(
        `SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`,
        [payment.user_id]
      );
      const user = userResult.rows[0];
      const bonusDays = user?.referral_bonus_days || 0;
      if (bonusDays > 0) {
        await query(`UPDATE ${TABLES.users} SET referral_bonus_days = 0 WHERE id = $1`, [payment.user_id]);
      }

      // Create subscription
      if (tariff) {
        const startDate = new Date().toISOString();
        const endDate = new Date(
          Date.now() + (tariff.duration_months * 30 + bonusDays) * 24 * 60 * 60 * 1000
        ).toISOString();
        await query(
          `INSERT INTO ${TABLES.subscriptions} (user_id, tariff_id, status, start_date, end_date, product_type)
           VALUES ($1, $2, 'active', $3, $4, $5)`,
          [payment.user_id, payment.product_id, startDate, endDate, payment.product_type]
        );
      }

      // Update payment status
      await query(
        `UPDATE ${TABLES.payments} SET status = 'approved', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
        [adminTelegramId || 0, paymentId]
      );
    } else if (action === 'reject') {
      await query(
        `UPDATE ${TABLES.payments} SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
        [adminTelegramId || 0, paymentId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update payment:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
