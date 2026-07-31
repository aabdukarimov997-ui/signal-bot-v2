import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BOT_TOKEN = process.env.BOT_TOKEN;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getAdminIds(): Promise<number[]> {
  try {
    const res = await query(
      `SELECT value FROM ${TABLES.settings} WHERE key = 'admin_ids' LIMIT 1`
    );
    if (res.rows[0]) {
      const parsed = JSON.parse(res.rows[0].value);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
    }
  } catch {}
  return [];
}

async function generateInvoiceId(): Promise<string> {
  const now = new Date();
  const prefix = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const countRes = await query(
    `SELECT COUNT(*) as c FROM ${TABLES.payments} WHERE created_at >= NOW() - INTERVAL '1 day'`
  );
  const count = parseInt(countRes.rows[0]?.c || '0', 10) + 1;
  // Race conditionni oldini olish uchun random suffix
  const rand = Math.floor(Math.random() * 90 + 10); // 10-99
  return `${prefix}-${String(count).padStart(4, '0')}-${rand}`;
}

const METHOD_LABELS: Record<string, string> = {
  card: '💳 UZCARD / HUMO',
  visa: '💳 Visa karta',
  tron_trc20: '🔗 TRON TRC20 (USDT)',
  bnb: '🟡 BNB BEP20 (USDT)',
  toncoin: '💎 TON (USDT)',
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File | null;
    const productType = String(formData.get('productType') || 'signal');
    const productId = String(formData.get('productId') || '');
    const paymentMethod = String(formData.get('paymentMethod') || 'card');
    const telegramId = String(formData.get('telegramId') || '').trim();
    const fullName = String(formData.get('fullName') || '').trim();

    if (!photo) {
      return NextResponse.json({ error: 'Skrinshot talab qilinadi' }, { status: 400 });
    }
    if (!telegramId || !/^\d+$/.test(telegramId)) {
      return NextResponse.json({ error: 'Telegram ID (raqam) talab qilinadi' }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: 'Tarif tanlanmagan' }, { status: 400 });
    }
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'BOT_TOKEN sozlanmagan (server)' }, { status: 500 });
    }
    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Rasm hajmi 10MB dan oshmasligi kerak' }, { status: 400 });
    }

    // ── 0. Adminlarni payment yaratishdan OLDIN tekshiramiz (yeti qolgan pending bo'lmasin) ──
    const adminIds = await getAdminIds();
    if (adminIds.length === 0) {
      return NextResponse.json({ error: 'Adminlar topilmadi (admin_ids sozlanmagan)' }, { status: 500 });
    }

    // ── 0.1 Tarifni DB'dan olamiz — summa klientdan emas, DB'dan ishonchli olinadi ──
    const tariffRes = await query(
      `SELECT * FROM ${TABLES.tariffs} WHERE id = $1 AND product_type = $2 LIMIT 1`,
      [productId, productType]
    );
    const tariff = tariffRes.rows[0];
    if (!tariff || !tariff.is_active) {
      return NextResponse.json({ error: 'Tarif topilmadi yoki faol emas' }, { status: 400 });
    }
    const amount = parseFloat(tariff.price);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Tarif narxi noto‘g‘ri' }, { status: 400 });
    }

    // ── 1. Bot user'ni topamiz yoki yaratamiz ──
    let userRes = await query(
      `SELECT * FROM ${TABLES.users} WHERE telegram_id = $1 LIMIT 1`,
      [Number(telegramId)]
    );
    let dbUser = userRes.rows[0];
    if (!dbUser) {
      const refCode = `ref_${telegramId}`;
      userRes = await query(
        `INSERT INTO ${TABLES.users}
         (id, telegram_id, full_name, username, referral_code, is_banned, is_admin, language, referral_bonus_days, created_at, updated_at)
         VALUES (gen_random_uuid()::text, $1, $2, '', $3, false, false, 'uz', 0, NOW(), NOW())
         RETURNING *`,
        [Number(telegramId), fullName || 'Website User', refCode]
      );
      dbUser = userRes.rows[0];
    }

    // ── 2. Payment yaratamiz (pending) ──
    const invoiceId = await generateInvoiceId();
    const payRes = await query(
      `INSERT INTO ${TABLES.payments}
       (id, user_id, product_type, product_id, invoice_id, amount, currency, payment_method, status, discount, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 'USD', $6, 'pending', 0, NOW(), NOW())
       RETURNING *`,
      [dbUser.id, productType, productId, invoiceId, amount, paymentMethod]
    );
    const payment = payRes.rows[0];

    // ── 3. Skrinshotni barcha adminlarga yuboramiz (approve/reject tugmalari bilan) ──
    const methodLabel = METHOD_LABELS[paymentMethod] || '💳 To‘lov';
    const caption = [
      '💳 <b>Yangi to‘lov (Sayt orqali)</b>',
      '',
      `🧾 ID: <code>#${invoiceId}</code>`,
      `👤 Foydalanuvchi: ${escapeHtml(fullName || dbUser.full_name)}`,
      `🆔 Telegram: <code>${escapeHtml(telegramId)}</code>`,
      `💰 Tarif: ${escapeHtml(tariff?.name || productId)}`,
      `💵 Summa: $${amount}`,
      `🔗 Usul: ${methodLabel}`,
      `📅 Vaqt: ${new Date().toLocaleString('uz-UZ')}`,
      '',
      'Quyidagi tugmalar orqali tasdiqlang yoki rad eting:',
    ].join('\n');

    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [
          { text: '✅ Qabul qilindi', callback_data: `approve_${payment.id}` },
          { text: '❌ Pul tushmadi', callback_data: `reject_${payment.id}` },
        ],
      ],
    });

    let fileId: string | null = null;
    let adminMessageId: number | null = null;
    let sentToAny = false;

    for (const adminId of adminIds) {
      try {
        const tgForm = new FormData();
        tgForm.append('chat_id', String(adminId));
        tgForm.append('photo', photo, photo.name || 'receipt.jpg');
        tgForm.append('caption', caption);
        tgForm.append('parse_mode', 'HTML');
        tgForm.append('reply_markup', replyMarkup);

        const tgRes = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
          { method: 'POST', body: tgForm }
        );
        const tgJson = await tgRes.json();

        if (tgJson?.ok && tgJson.result) {
          sentToAny = true;
          if (!fileId && tgJson.result.photo?.length) {
            fileId = tgJson.result.photo[tgJson.result.photo.length - 1].file_id;
          }
          if (adminMessageId === null) {
            adminMessageId = tgJson.result.message_id;
          }
        }
      } catch {
        // Bitta admin muvaffaqiyatsiz bo‘lsa ham boshqasiga yuboramiz
      }
    }

    // ── 5. Hech bir admin rasm olmasa — paymentni o'chiramiz, xato qaytaramiz ──
    if (!sentToAny) {
      await query(
        `DELETE FROM ${TABLES.payments} WHERE id = $1`,
        [payment.id]
      );
      return NextResponse.json(
        { error: 'To‘lov xabari adminlarga yuborilmadi. Iltimos qayta urinib ko‘ring.' },
        { status: 502 }
      );
    }

    // ── 6. photo_file_id ni saqlaymiz ──
    if (fileId) {
      await query(
        `UPDATE ${TABLES.payments} SET photo_file_id = $1, admin_message_id = $2 WHERE id = $3`,
        [fileId, adminMessageId, payment.id]
      );
    }

    return NextResponse.json(
      { success: true, message: 'To‘lov tasdiqlash uchun yuborildi', payment: { ...payment, id: payment.id } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Website payment error:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
