import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function POST(request: Request) {
  try {
    const { userId, productType, productId, amount, paymentMethod, photoFileId } = await request.json();

    if (!userId || !productId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a payment record (pending, needs admin approval for card methods)
    const isAutoApprove = paymentMethod === 'stars';
    const status = isAutoApprove ? 'approved' : 'pending';

    const result = await query(
      `INSERT INTO ${TABLES.payments} 
       (user_id, product_type, product_id, amount, currency, payment_method, status, photo_file_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [userId, productType, productId, amount, 'USD', paymentMethod, status, photoFileId || null]
    );

    const payment = result.rows[0];

    // If auto-approved (stars), create subscription
    if (isAutoApprove) {
      const tariffResult = await query(
        `SELECT * FROM ${TABLES.tariffs} WHERE id = $1 LIMIT 1`,
        [productId]
      );
      const tariff = tariffResult.rows[0];

      if (tariff) {
        // Get user's bonus days
        const userResult = await query(
          `SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`,
          [userId]
        );
        const user = userResult.rows[0];
        const bonusDays = user?.referral_bonus_days || 0;

        if (bonusDays > 0) {
          await query(
            `UPDATE ${TABLES.users} SET referral_bonus_days = 0 WHERE id = $1`,
            [userId]
          );
        }

        // Duration: prefer duration_days (1-day / 1-week tariffs), else months
        const tariffDays = tariff.duration_days || (tariff.duration_months || 0) * 30;
        const startDate = new Date().toISOString();
        const endDate = new Date(
          Date.now() + (tariffDays + bonusDays) * 24 * 60 * 60 * 1000
        ).toISOString();

        await query(
          `INSERT INTO ${TABLES.subscriptions} 
           (user_id, tariff_id, status, start_date, end_date, reminder_7_sent, reminder_3_sent, reminder_1_sent)
           VALUES ($1, $2, 'active', $3, $4, false, false, false)`,
          [userId, productId, startDate, endDate]
        );
      }
    }

    return NextResponse.json({ payment: { ...payment, id: payment.id } }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create payment:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
