import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export const runtime = 'nodejs';

const BOT_TOKEN = process.env.BOT_TOKEN;

export async function POST(request: Request) {
  try {
    const { tariffId } = await request.json();
    if (!tariffId) {
      return NextResponse.json({ error: 'tariffId required' }, { status: 400 });
    }
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'BOT_TOKEN not configured' }, { status: 500 });
    }

    const tariffRes = await query(
      `SELECT * FROM ${TABLES.tariffs} WHERE id = $1 AND is_active = true LIMIT 1`,
      [tariffId]
    );
    const tariff = tariffRes.rows[0];
    if (!tariff) {
      return NextResponse.json({ error: 'Tarif topilmadi' }, { status: 404 });
    }

    // Stars narxi: sozlangan bo'lsa (signal_stars_X_month), aks holda price * 50
    let starsAmount = 0;
    const monthsKey = tariff.duration_months ? `signal_stars_${tariff.duration_months}_month` : null;
    if (monthsKey) {
      const s = await query(`SELECT value FROM ${TABLES.settings} WHERE key = $1 LIMIT 1`, [monthsKey]);
      const v = s.rows[0]?.value;
      if (v && /^\d+$/.test(String(v))) starsAmount = parseInt(String(v), 10);
    }
    if (!starsAmount) starsAmount = Math.round(parseFloat(tariff.price) * 50);
    if (!starsAmount || starsAmount <= 0) {
      return NextResponse.json({ error: 'Stars narxi sozlanmagan' }, { status: 400 });
    }

    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `📈 ${tariff.name || 'Signal obuna'}`,
        description: `Signal kanaliga ${tariff.name || 'obuna'}`,
        payload: `signal_stars_${tariff.id}`,
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: tariff.name || 'Signal', amount: starsAmount }],
      }),
    });
    const data = await r.json();

    if (!data.ok) {
      console.error('createInvoiceLink error:', data.description);
      return NextResponse.json({ error: data.description || 'Invoice yaratilmadi' }, { status: 500 });
    }

    return NextResponse.json({ invoiceUrl: data.result });
  } catch (error: any) {
    console.error('Invoice route error:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
