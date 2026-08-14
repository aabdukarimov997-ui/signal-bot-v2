import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { sendAdminPaymentNotification } from '@/lib/tma/telegram';

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
       (id, user_id, product_type, product_id, amount, currency, payment_method, status, discount, photo_file_id, created_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, 0, $8, NOW())
       RETURNING *`,
      [userId, productType, productId, amount, 'USD', paymentMethod, status, photoFileId || null]
    );

    const payment = result.rows[0];

    // If auto-approved (stars), create or EXTEND subscription
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
        const totalDays = tariffDays + bonusDays;

        // Existing ACTIVE subscription of the same product type? → EXTEND it (no duplicates)
        const existingRes = await query(
          `SELECT s.* FROM ${TABLES.subscriptions} s
           JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id
           WHERE s.user_id = $1 AND s.status = 'active' AND t.product_type = $2
           ORDER BY s.end_date DESC LIMIT 1`,
          [userId, productType]
        );
        const existingSub = existingRes.rows[0];

        if (existingSub) {
          // Uzaytirish: joriy end_date ga kunlarni qo'shamiz, eslatma flaglarini reset qilamiz.
          // Agar end_date allaqachon o'tib ketgan bo'lsa (eski aktiv qator, hali expire bo'lmagan)
          // — bazani hozirgi vaqtdan boshlaymiz, aks holda foydalanuvchi kunlardan yutqazadi.
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
          // Yangi obuna
          const startDate = new Date().toISOString();
          const endDate = new Date(
            Date.now() + totalDays * 24 * 60 * 60 * 1000
          ).toISOString();

          await query(
            `INSERT INTO ${TABLES.subscriptions} 
             (id, user_id, tariff_id, status, start_date, end_date, auto_renew, reminder_7_sent, reminder_3_sent, reminder_1_sent)
             VALUES (gen_random_uuid()::text, $1, $2, 'active', $3, $4, false, false, false, false)`,
            [userId, productId, startDate, endDate]
          );
        }
      }
    }

    // Adminlarga Telegram xabar yuboramiz (karta/chek to'lovlar uchun) —
    // admin tugmani bossa, BOT to'liq oqimni bajaradi (invite link + obuna + xabar)
    if (!isAutoApprove) {
      try {
        const userResult = await query(
          `SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`,
          [userId]
        );
        const tariffResult = await query(
          `SELECT * FROM ${TABLES.tariffs} WHERE id = $1 LIMIT 1`,
          [productId]
        );
        await sendAdminPaymentNotification(
          result.rows[0],
          userResult.rows[0],
          tariffResult.rows[0]
        );
      } catch (e) {
        console.error('Admin payment notification failed:', e);
      }
    }

    return NextResponse.json({ payment: { ...payment, id: payment.id } }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create payment:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
