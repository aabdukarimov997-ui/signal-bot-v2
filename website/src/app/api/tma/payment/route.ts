import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { sendAdminPaymentNotification } from '@/lib/tma/telegram';
import { getAuthenticatedUser, getInitDataFromRequest } from '@/lib/tma/verify';
import { createCryptoPayInvoice, isCryptoPayAvailable } from '@/lib/tma/cryptopay';
import { resolvePrice } from '@/lib/tma/pricing';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

// Blokcheyn orqali AVTOMATIK tekshiriladigan usullar (bot tomonidagi poller)
const AUTO_CRYPTO_METHODS: Record<string, 'tron' | 'bnb'> = {
  tron_trc20: 'tron',
  bnb: 'bnb',
};
const CRYPTO_PAY_METHOD = 'crypto_pay';

const CRYPTO_WALLET_SETTING: Record<string, string> = {
  tron: 'tron_wallet_address',
  bnb: 'bnb_wallet_address',
};

async function getSetting(key: string): Promise<string> {
  const res = await query(`SELECT value FROM ${TABLES.settings} WHERE key = $1 LIMIT 1`, [key]);
  return res.rows[0]?.value || '';
}

/**
 * Noyob kripto summa yaratadi (masalan $25 → 25.0137).
 * Blokcheyndagi transfer aynan shu summa bo'yicha invoice'ga bog'lanadi.
 */
async function generateUniqueCryptoAmount(base: number): Promise<number> {
  for (let i = 0; i < 50; i++) {
    const candidate = Math.round((base + Math.floor(Math.random() * 9999 + 1) / 10000) * 10000) / 10000;
    const existing = await query(
      `SELECT id FROM ${TABLES.payments}
       WHERE crypto_amount = $1 AND status = 'pending' AND crypto_network IS NOT NULL
       LIMIT 1`,
      [candidate]
    );
    if (existing.rows.length === 0) return candidate;
  }
  return Math.round(base * 10000) / 10000;
}

export async function POST(request: Request) {
  try {
    // Identifikatsiya initData dan — client yuborgan userId ga ishonmaymiz
    const auth = await getAuthenticatedUser(getInitDataFromRequest(request));
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const userId = auth.user.id;

    const { productId, paymentMethod, photoFileId } = await request.json();

    if (!productId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Faqat qo'llab-quvvatlanadigan karta/kripto usullari
    const ALLOWED_METHODS = new Set(['card', 'visa', 'tron_trc20', 'bnb', 'toncoin', CRYPTO_PAY_METHOD]);
    if (!ALLOWED_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: "Noto'g'ri to'lov usuli" }, { status: 400 });
    }

    // Stars to'lovi Telegram tomonidan botga yuboriladigan successful_payment orqali
    // tasdiqlanadi (bot/handlers/signals.py). Bu endpoint orqali faollashtirilmaydi.
    // Tarifni tekshiramiz va NARXNI SERVER TOMONDA hisoblaymiz (client amount ga ishonmaymiz)
    const tariffRes = await query(
      `SELECT * FROM ${TABLES.tariffs} WHERE id = $1 AND is_active = true LIMIT 1`,
      [productId]
    );
    const tariff = tariffRes.rows[0];
    if (!tariff) {
      return NextResponse.json({ error: 'Tarif topilmadi' }, { status: 404 });
    }
    // Mahsulot turi faqat tarifdan olinadi — client yuborgan productType ga ishonmaymiz
    // (aks holda 'course' tarifni 'signal' deb belgilash mumkin bo'ladi).
    const resolvedProductType = tariff.product_type;
    // Narx server tomonda hisoblanadi — faol obunasi borlarga chegirma qo'llanadi.
    const price = await resolvePrice(userId, parseFloat(tariff.price), resolvedProductType);
    const amount = price.final;

    if (paymentMethod === CRYPTO_PAY_METHOD && !isCryptoPayAvailable()) {
      return NextResponse.json({ error: 'Crypto Pay mavjud emas' }, { status: 400 });
    }

    if (paymentMethod === CRYPTO_PAY_METHOD) {
      const existing = await query(
        `SELECT id, status, provider_charge_id, telegram_charge_id, crypto_expires_at
         FROM ${TABLES.payments}
         WHERE user_id = $1 AND product_id = $2 AND payment_method = $3
           AND status = 'pending' AND crypto_expires_at > NOW()
           AND telegram_charge_id IS NOT NULL
         ORDER BY created_at DESC LIMIT 1`,
        [userId, productId, CRYPTO_PAY_METHOD]
      );
      if (existing.rows[0]) {
        const payment = existing.rows[0];
        return NextResponse.json({
          payment: {
            id: payment.id,
            status: payment.status,
            cryptoPay: true,
            providerInvoiceId: String(payment.provider_charge_id),
            providerInvoiceUrl: payment.telegram_charge_id,
          },
        });
      }
    }

    // Karta/kripto to'lovlari har doim 'pending'.
    // TRON/BNB uchun noyob summa beriladi — bot blokcheyndagi tranzaksiyani
    // shu summa bo'yicha topib, to'lovni AVTOMATIK tasdiqlaydi.
    const network = AUTO_CRYPTO_METHODS[paymentMethod];
    let cryptoAmount: number | null = null;
    let cryptoAddress: string | null = null;
    let cryptoExpiresAt: Date | null = null;

    if (network) {
      cryptoAddress = await getSetting(CRYPTO_WALLET_SETTING[network]);
      if (!cryptoAddress) {
        return NextResponse.json({ error: `${network.toUpperCase()} wallet sozlanmagan` }, { status: 400 });
      }
      cryptoAmount = await generateUniqueCryptoAmount(amount);
      cryptoExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }

    const paymentId = randomUUID();
    const cryptoPayExpiresAt = paymentMethod === CRYPTO_PAY_METHOD
      ? new Date(Date.now() + 60 * 60 * 1000)
      : null;
    const result = await query(
      `INSERT INTO ${TABLES.payments} 
       (id, user_id, product_type, product_id, amount, currency, payment_method, status, discount, photo_file_id,
        crypto_network, crypto_address, crypto_amount, crypto_expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
       RETURNING *`,
      [
        paymentId, userId, resolvedProductType, productId, amount, 'USD', paymentMethod, 'pending',
        price.saved, photoFileId || null, network || null, cryptoAddress, cryptoAmount,
        cryptoPayExpiresAt || cryptoExpiresAt,
      ]
    );

    let payment = result.rows[0];

    if (paymentMethod === CRYPTO_PAY_METHOD) {
      try {
        const invoice = await createCryptoPayInvoice(String(amount), paymentId);
        const updated = await query(
          `UPDATE ${TABLES.payments}
           SET provider_charge_id = $1, telegram_charge_id = $2
           WHERE id = $3 AND status = 'pending'
           RETURNING *`,
          [String(invoice.invoice_id), invoice.bot_invoice_url, paymentId]
        );
        payment = updated.rows[0] || payment;
      } catch {
        await query(`UPDATE ${TABLES.payments} SET status = 'failed' WHERE id = $1 AND status = 'pending'`, [paymentId]);
        return NextResponse.json({ error: 'Crypto Pay invoice yaratilmadi' }, { status: 502 });
      }
    }

    // Adminlarga Telegram xabar faqat QO'LDA tasdiqlanadigan usullar uchun.
    // Avtomatik kripto to'lovlar blokcheyndan tekshirilib, adminlarga natija
    // haqida alohida xabar boradi (bot/services/payment_finalizer.py).
    if (!network && paymentMethod !== CRYPTO_PAY_METHOD) {
      try {
        const userResult = await query(`SELECT * FROM ${TABLES.users} WHERE id = $1 LIMIT 1`, [userId]);
        const tariffResult = await query(`SELECT * FROM ${TABLES.tariffs} WHERE id = $1 LIMIT 1`, [productId]);
        await sendAdminPaymentNotification(result.rows[0], userResult.rows[0], tariffResult.rows[0]);
      } catch (e) {
        console.error('Admin payment notification failed:', e);
      }
    }

    return NextResponse.json(
      {
        payment: {
          ...payment,
          id: payment.id,
          cryptoNetwork: network || null,
          cryptoAddress,
          cryptoAmount,
           autoVerify: Boolean(network),
          cryptoPay: paymentMethod === CRYPTO_PAY_METHOD,
          providerInvoiceId: payment.provider_charge_id || null,
          providerInvoiceUrl: payment.telegram_charge_id || null,
          cryptoExpiresAt: payment.crypto_expires_at || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create payment:', error);
    return NextResponse.json({ error: 'To\'lovni yaratib bo\'lmadi' }, { status: 500 });
  }
}
