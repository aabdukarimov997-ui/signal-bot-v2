import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import {
  getChannelId,
  getInviteLink,
  notifyPaymentApproved,
  notifyPaymentRejected,
} from '@/lib/tma/telegram';

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

      // Dublikat tasdiqlashni oldini olish — faqat 'pending' to'lov tasdiqlanadi
      if (payment.status !== 'pending') {
        return NextResponse.json({ error: 'To‘lov allaqachon ko‘rib chiqilgan' }, { status: 409 });
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

      // Create or EXTEND subscription (dublikat aktiv qatorlardan qochamiz)
      if (tariff) {
        const tariffDays = tariff.duration_days || (tariff.duration_months || 0) * 30;
        const totalDays = tariffDays + bonusDays;

        const existingRes = await query(
          `SELECT s.* FROM ${TABLES.subscriptions} s
           JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id
           WHERE s.user_id = $1 AND s.status = 'active' AND t.product_type = $2
           ORDER BY s.end_date DESC LIMIT 1`,
          [payment.user_id, payment.product_type]
        );
        const existingSub = existingRes.rows[0];

        if (existingSub) {
          const baseTime = Math.max(Date.now(), new Date(existingSub.end_date).getTime());
          const newEnd = new Date(baseTime + totalDays * 24 * 60 * 60 * 1000);
          await query(
            `UPDATE ${TABLES.subscriptions}
             SET end_date = $1,
                 reminder_7_sent = false,
                 reminder_3_sent = false,
                 reminder_1_sent = false
             WHERE id = $2`,
            [newEnd.toISOString(), existingSub.id]
          );
        } else {
          const startDate = new Date().toISOString();
          const endDate = new Date(
            Date.now() + totalDays * 24 * 60 * 60 * 1000
          ).toISOString();
          await query(
            `INSERT INTO ${TABLES.subscriptions} (user_id, tariff_id, status, start_date, end_date, product_type, reminder_7_sent, reminder_3_sent, reminder_1_sent)
             VALUES ($1, $2, 'active', $3, $4, $5, false, false, false)`,
            [payment.user_id, payment.product_id, startDate, endDate, payment.product_type]
          );
        }
      }

      // Update payment status
      await query(
        `UPDATE ${TABLES.payments} SET status = 'approved', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
        [adminTelegramId || 0, paymentId]
      );

      // Bot tomoni: invite link yaratish + obunaga yozish + foydalanuvchiga Telegram xabar
      try {
        const channelId = await getChannelId(tariff);
        const inviteLink = await getInviteLink(channelId);
        if (inviteLink) {
          await query(
            `UPDATE ${TABLES.subscriptions} SET invite_link = $1
             WHERE id = (SELECT s.id FROM ${TABLES.subscriptions} s
                         WHERE s.user_id = $2 AND s.status = 'active' AND s.product_type = $3
                         ORDER BY s.end_date DESC LIMIT 1)`,
            [inviteLink, payment.user_id, payment.product_type]
          );
        }
        if (user?.telegram_id) {
          await notifyPaymentApproved(String(user.telegram_id), inviteLink);
        }
      } catch (e) {
        console.error('Bot approve side failed:', e);
      }
    } else if (action === 'reject') {
      await query(
        `UPDATE ${TABLES.payments} SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
        [adminTelegramId || 0, paymentId]
      );

      // Bot tomoni: foydalanuvchiga rad etilgani haqida xabar
      try {
        const paymentResult = await query(
          `SELECT * FROM ${TABLES.payments} WHERE id = $1 LIMIT 1`,
          [paymentId]
        );
        const paymentRow = paymentResult.rows[0];
        if (paymentRow) {
          const userResult = await query(
            `SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`,
            [paymentRow.user_id]
          );
          const targetUser = userResult.rows[0];
          if (targetUser?.telegram_id) {
            await notifyPaymentRejected(String(targetUser.telegram_id));
          }
        }
      } catch (e) {
        console.error('Bot reject side failed:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update payment:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
