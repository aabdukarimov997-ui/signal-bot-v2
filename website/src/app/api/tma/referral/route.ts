import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const userResult = await query(
      `SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`,
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral stats
    const refCountResult = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.referralStats} WHERE referrer_id = $1`,
      [userId]
    );
    const referralCount = parseInt(refCountResult.rows[0]?.count || '0');

    // Get active referrals (users who have active subscription and were referred by this user)
    const activeRefResult = await query(
      `SELECT COUNT(DISTINCT u.id) as count 
       FROM ${TABLES.users} u 
       JOIN ${TABLES.referralStats} rs ON rs.referred_id = u.id 
       JOIN ${TABLES.subscriptions} s ON s.user_id = u.id AND s.status = 'active'
       WHERE rs.referrer_id = $1`,
      [userId]
    );
    const activeCount = parseInt(activeRefResult.rows[0]?.count || '0');

    // Get bonus days
    const bonusDays = user.referral_bonus_days || 0;

    return NextResponse.json({
      referralCode: user.referral_code || `ref_${user.telegram_id}`,
      referralCount,
      activeCount,
      bonusDays,
    });
  } catch (error: any) {
    console.error('Failed to fetch referral:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
