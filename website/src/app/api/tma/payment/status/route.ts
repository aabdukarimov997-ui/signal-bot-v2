import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { getAuthenticatedUser, getInitDataFromRequest } from '@/lib/tma/verify';

export const runtime = 'nodejs';

/**
 * To'lov holatini tekshirish (mini-app polling uchun).
 * Faqat autentifikatsiya qilingan foydalanuvchining o'z to'lovi qaytariladi.
 */
export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(getInitDataFromRequest(request));
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const paymentId = url.searchParams.get('paymentId');
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId talab qilinadi' }, { status: 400 });
    }

    const result = await query(
      `SELECT id, status, payment_method, crypto_network, crypto_amount, crypto_tx_hash,
              auto_approved, product_type, amount, created_at, crypto_expires_at,
              telegram_charge_id
       FROM ${TABLES.payments}
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [paymentId, auth.user.id]
    );

    const payment = result.rows[0];
    if (!payment) {
      return NextResponse.json({ error: 'To‘lov topilmadi' }, { status: 404 });
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: payment.status,
        paymentMethod: payment.payment_method,
        cryptoNetwork: payment.crypto_network,
        cryptoAmount: payment.crypto_amount ? parseFloat(payment.crypto_amount) : null,
        cryptoTxHash: payment.crypto_tx_hash,
        autoApproved: Boolean(payment.auto_approved),
        productType: payment.product_type,
        amount: parseFloat(payment.amount),
        createdAt: payment.created_at,
        cryptoExpiresAt: payment.crypto_expires_at,
        providerInvoiceUrl: payment.telegram_charge_id,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch payment status:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
