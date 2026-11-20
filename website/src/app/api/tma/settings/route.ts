import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { isCryptoPayAvailable } from '@/lib/tma/cryptopay';

// Mini-app faqat to'lov uchun kerak bo'lgan ommaviy sozlamalarni oladi.
// Maxfiy yoki ichki kalitlar (masalan admin_ids) hech qachon clientga yuborilmaydi.
const PUBLIC_SETTING_KEYS = new Set([
  'card_number',
  'card_owner',
  'visa_card_number',
  'visa_card_holder',
  'ton_wallet_address',
  'tron_wallet_address',
  'bnb_wallet_address',
  'toncoin_wallet_address',
  'payment_instructions',
  'support_username',
]);

export async function GET() {
  try {
    const result = await query(
      `SELECT key, value FROM ${TABLES.settings} WHERE key = ANY($1::text[])`,
      [Array.from(PUBLIC_SETTING_KEYS)]
    );
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      if (PUBLIC_SETTING_KEYS.has(row.key)) {
        settings[row.key] = row.value;
      }
    }
    return NextResponse.json({ settings, cryptoPayAvailable: isCryptoPayAvailable() });
  } catch (error: any) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
