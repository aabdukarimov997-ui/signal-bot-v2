import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { verifyInitData } from '@/lib/tma/verify';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    if (!initData) {
      return NextResponse.json({ error: 'initData required' }, { status: 400 });
    }

    // Telegram imzosini tekshiramiz — soxta initData rad etiladi
    const verified = verifyInitData(initData);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid initData signature' }, { status: 401 });
    }

    const telegramId = verified.telegramId;
    const fullName = verified.firstName;
    const username = verified.username;
    const language = verified.languageCode || 'uz';

    // Find or create user in bot DB
    let result = await query(
      `SELECT * FROM ${TABLES.users} WHERE telegram_id = $1 LIMIT 1`,
      [telegramId]
    );

    let dbUser = result.rows[0];

    if (!dbUser) {
      const refCode = `ref_${telegramId}`;
      result = await query(
        `INSERT INTO ${TABLES.users}
         (id, telegram_id, full_name, username, language, is_banned, is_admin, referral_code, referral_bonus_days, phone_number, bio, created_at, updated_at)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, false, false, $5, 0, NULL, NULL, NOW(), NOW())
         RETURNING *`,
        [telegramId, fullName, username, language, refCode]
      );
      dbUser = result.rows[0];
    } else {
      // Update activity
      await query(
        `UPDATE ${TABLES.users} SET full_name = $1, username = $2, language = $3, updated_at = NOW() WHERE telegram_id = $4`,
        [fullName, username, language, telegramId]
      );
    }

    if (dbUser.is_banned) {
      return NextResponse.json({ error: 'Accaunt bloklangan' }, { status: 403 });
    }

    // Check if user is admin
    const adminIdsResult = await query(
      `SELECT value FROM ${TABLES.settings} WHERE key = 'admin_ids' LIMIT 1`
    );
    let isAdmin = false;
    if (adminIdsResult.rows[0]) {
      try {
        const adminIds = JSON.parse(adminIdsResult.rows[0].value);
        isAdmin = adminIds.map(String).includes(String(telegramId));
      } catch {}
    }

    // Get referral count
    const refCountResult = await query(
      `SELECT COUNT(*) as count FROM ${TABLES.referralStats} WHERE referrer_id = $1`,
      [dbUser.id]
    );
    const referralCount = parseInt(refCountResult.rows[0]?.count || '0');

    return NextResponse.json({
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegram_id,
        fullName: dbUser.full_name,
        username: dbUser.username,
        isBanned: dbUser.is_banned,
        isAdmin,
        referralBonusDays: dbUser.referral_bonus_days || 0,
        referralCount,
      },
      authenticated: true,
    });
  } catch (error: any) {
    console.error('TMA Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', message: error?.message },
      { status: 500 }
    );
  }
}