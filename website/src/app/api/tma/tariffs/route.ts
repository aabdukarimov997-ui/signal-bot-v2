import { NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/tma/db';
import { getAuthenticatedUser, getInitDataFromRequest } from '@/lib/tma/verify';
import { applyPrice, applyStarsDiscount, getDiscountContext } from '@/lib/tma/pricing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'signal';

    const result = await query(
      `SELECT * FROM ${TABLES.tariffs} WHERE product_type = $1 AND is_active = true ORDER BY sort_order ASC`,
      [type]
    );

    // Chegirmani aniqlash uchun foydalanuvchini initData orqali tekshiramiz.
    // initData bo'lmasa (masalan, ochiq ko'rish) — chegirmasiz narx qaytadi.
    const auth = await getAuthenticatedUser(getInitDataFromRequest(request));
    const userId = 'user' in auth ? auth.user.id : null;

    // Butun ro'yxat uchun bir marta tekshiramiz (N+1 query'dan qochish).
    const ctx = await getDiscountContext(userId, type);

    const tariffs = result.rows.map((t: any) => {
      const price = applyPrice(parseFloat(t.price), ctx);
      const baseStars = t.stars_price || parseFloat(t.price) * 50;
      return {
        id: t.id,
        name: t.name,
        durationMonths: t.duration_months,
        durationDays: t.duration_days ?? null,
        price: price.final,
        originalPrice: price.base,
        discountPercent: price.discountPercent,
        starsPrice: applyStarsDiscount(baseStars, price.discountPercent),
        originalStarsPrice: baseStars,
        isActive: t.is_active,
        productType: t.product_type,
      };
    });

    return NextResponse.json({ tariffs });
  } catch (error: any) {
    console.error('Failed to fetch tariffs:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
