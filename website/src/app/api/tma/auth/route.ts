import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    if (!initData) {
      return NextResponse.json({ error: 'initData required' }, { status: 400 });
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) {
      return NextResponse.json({ error: 'User not found in initData' }, { status: 401 });
    }
    
    const tgUser = JSON.parse(userJson);
    const telegramId = String(tgUser.id);
    const fullName = tgUser.first_name || tgUser.last_name || 'User';
    const username = tgUser.username || '';
    // users.language ustuni NOT NULL — bot modeliga mos ravishda yozamiz
    const language = tgUser.language_code || 'uz';

    // Find or create user in bot DB
    let result = await query(
      `SELECT * FROM ${TABLES.users} WHERE telegram_id = $1 LIMIT 1`,
      [telegramId]
    );
    
    let dbUser = result.rows[0];
    
    if (!dbUser) {
      const refCode = `ref_${telegramId}`;
      result = await query(
        `INSERT INTO ${TABLES.users} (telegram_id, full_name, username, language, referral_code, is_banned, referral_bonus_days, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, false, 0, NOW(), NOW())
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

    // Check if user is admin
    const adminIdsResult = await query(
      `SELECT value FROM ${TABLES.settings} WHERE key = 'admin_ids' LIMIT 1`
    );
    let isAdmin = false;
    if (adminIdsResult.rows[0]) {
      try {
        const adminIds = JSON.parse(adminIdsResult.rows[0].value);
        isAdmin = adminIds.includes(Number(telegramId));
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
