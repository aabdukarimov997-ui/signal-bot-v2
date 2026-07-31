import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // ── User info from bot DB ──
    const userRes = await query(
      `SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`,
      [userId]
    );
    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    // ── Active subscription (latest, any product type) ──
    const subRes = await query(
      `SELECT s.*, t.name as tariff_name
       FROM ${TABLES.subscriptions} s
       LEFT JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.end_date DESC LIMIT 1`,
      [userId]
    );
    const sub = subRes.rows[0] || null;
    let subscription = null;
    if (sub) {
      const end = new Date(sub.end_date);
      const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      subscription = {
        id: sub.id,
        tariffName: sub.tariff_name || 'Signal',
        productType: 'signal',
        status: sub.status,
        startDate: sub.start_date,
        endDate: sub.end_date,
        daysLeft,
        inviteLink: sub.invite_link || null,
      };
    }

    // ── Signal history (all subscriptions, newest first) ──
    const histRes = await query(
      `SELECT s.*, t.name as tariff_name
       FROM ${TABLES.subscriptions} s
       LEFT JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id
       WHERE s.user_id = $1
       ORDER BY s.end_date DESC LIMIT 20`,
      [userId]
    );
    const signalHistory = histRes.rows.map((h: any) => ({
      id: h.id,
      tariffName: h.tariff_name || 'Signal',
      productType: 'signal',
      status: h.status,
      startDate: h.start_date,
      endDate: h.end_date,
      daysLeft: Math.max(0, Math.ceil((new Date(h.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
    }));

    // ── Payment history ──
    const payRes = await query(
      `SELECT * FROM ${TABLES.payments}
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    const payments = payRes.rows.map((p: any) => ({
      id: p.id,
      productType: p.product_type,
      amount: Number(p.amount),
      currency: p.currency || 'USD',
      paymentMethod: p.payment_method,
      status: p.status,
      createdAt: p.created_at,
    }));

    // ── Referral stats ──
    const refCountRes = await query(
      `SELECT COUNT(*) as c FROM ${TABLES.referralStats} WHERE referrer_id = $1`,
      [userId]
    );
    const referralCount = parseInt(refCountRes.rows[0]?.c || '0');

    const activeRefRes = await query(
      `SELECT COUNT(DISTINCT u.id) as c
       FROM ${TABLES.users} u
       JOIN ${TABLES.referralStats} rs ON rs.referred_id = u.id
       JOIN ${TABLES.subscriptions} s ON s.user_id = u.id AND s.status = 'active'
       WHERE rs.referrer_id = $1`,
      [userId]
    );
    const activeCount = parseInt(activeRefRes.rows[0]?.c || '0');

    return NextResponse.json({
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        fullName: user.full_name,
        username: user.username || null,
        referralCode: user.referral_code || `ref_${user.telegram_id}`,
        referralBonusDays: user.referral_bonus_days || 0,
      },
      subscription,
      signalHistory,
      payments,
      referral: {
        referralCode: user.referral_code || `ref_${user.telegram_id}`,
        referralCount,
        activeCount,
        bonusDays: user.referral_bonus_days || 0,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch dashboard:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
