import { query, TABLES } from './db';

export const DEFAULT_DISCOUNT_PERCENT = 25;

export interface ResolvedPrice {
  base: number;
  final: number;
  discountPercent: number;
  saved: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Admin sozlagan chegirma foizi (0-100). Standart: 25%.
 * Bot tomondagi `loyalty_discount_percent` sozlamasi bilan bir xil kalit.
 */
export async function getLoyaltyDiscountPercent(): Promise<number> {
  try {
    const res = await query(
      `SELECT value FROM ${TABLES.settings} WHERE key = 'loyalty_discount_percent' LIMIT 1`
    );
    const raw = res.rows[0]?.value;
    if (raw === undefined || raw === null || raw === '') return DEFAULT_DISCOUNT_PERCENT;
    const parsed = parseInt(String(raw), 10);
    if (Number.isNaN(parsed)) return DEFAULT_DISCOUNT_PERCENT;
    return Math.min(Math.max(parsed, 0), 100);
  } catch {
    return DEFAULT_DISCOUNT_PERCENT;
  }
}

/** Foydalanuvchida shu mahsulot turi bo'yicha FAOL obuna bor mi. */
export async function hasActiveSubscription(userId: string, productType: string): Promise<boolean> {
  const res = await query(
    `SELECT s.id FROM ${TABLES.subscriptions} s
     JOIN ${TABLES.tariffs} t ON s.tariff_id = t.id
     WHERE s.user_id = $1 AND s.status = 'active'
       AND t.product_type = $2 AND s.end_date > NOW()
     LIMIT 1`,
    [userId, productType]
  );
  return res.rows.length > 0;
}

/** Narxni hisoblaydi — faol obunasi bo'lsa chegirma qo'llanadi (server tomonda). */
export async function resolvePrice(
  userId: string | null,
  basePrice: number,
  productType: string
): Promise<ResolvedPrice> {
  const base = round2(Number(basePrice));
  if (!userId || !(await hasActiveSubscription(userId, productType))) {
    return { base, final: base, discountPercent: 0, saved: 0 };
  }
  const discountPercent = await getLoyaltyDiscountPercent();
  if (discountPercent <= 0) {
    return { base, final: base, discountPercent: 0, saved: 0 };
  }
  const final = round2((base * (100 - discountPercent)) / 100);
  return { base, final, discountPercent, saved: round2(base - final) };
}

/** Yulduz (Stars) narxiga chegirmani qo'llaydi. */
export function applyStarsDiscount(stars: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return stars;
  return Math.max(1, Math.round((stars * (100 - discountPercent)) / 100));
}

export interface DiscountContext {
  active: boolean;
  percent: number;
}

/** Bir marta hisoblanadi — keyin ko'p tarifga qo'llash uchun (N+1 query'dan qochish). */
export async function getDiscountContext(userId: string | null, productType: string): Promise<DiscountContext> {
  if (!userId || !(await hasActiveSubscription(userId, productType))) {
    return { active: false, percent: 0 };
  }
  const percent = await getLoyaltyDiscountPercent();
  return { active: percent > 0, percent: percent > 0 ? percent : 0 };
}

/** Kontekst asosida narxni hisoblaydi. */
export function applyPrice(basePrice: number, ctx: DiscountContext): ResolvedPrice {
  const base = round2(Number(basePrice));
  if (!ctx.active || ctx.percent <= 0) {
    return { base, final: base, discountPercent: 0, saved: 0 };
  }
  const final = round2((base * (100 - ctx.percent)) / 100);
  return { base, final, discountPercent: ctx.percent, saved: round2(base - final) };
}
