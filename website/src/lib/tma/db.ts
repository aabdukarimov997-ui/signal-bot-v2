import { Pool } from 'pg';

let pool: Pool | null = null;

export function getBotDb(): Pool {
  if (!pool) {
    const url = process.env.TMA_DATABASE_URL || process.env.BOT_DATABASE_URL;
    if (!url) {
      // Fallback: build from individual env vars
      const host = process.env.DB_HOST || 'localhost';
      const port = parseInt(process.env.DB_PORT || '5432');
      const database = process.env.DB_NAME || 'signal_bot_v2';
      const user = process.env.DB_USER || 'postgres';
      const password = process.env.DB_PASSWORD || '';

      pool = new Pool({ host, port, database, user, password });
    } else {
      pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    }
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const client = await getBotDb().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Bot DB table names
export const TABLES = {
  users: 'users',
  tariffs: 'signal_tariffs',
  subscriptions: 'subscriptions',
  payments: 'payments',
  settings: 'project_settings',
  promoCodes: 'promo_codes',
  referralStats: 'referral_stats',
  contactMessages: 'contact_messages',
};

export interface BotUser {
  id: number;
  telegram_id: string;
  full_name: string;
  username?: string;
  is_banned: boolean;
  referred_by?: string;
  referral_bonus_days: number;
  created_at: Date;
  updated_at: Date;
}

export interface BotTariff {
  id: number;
  name: string;
  duration_months: number;
  price: number;
  stars_price: number;
  is_active: boolean;
  sort_order: number;
  product_type: string; // 'signal' | 'course'
}

export interface BotSubscription {
  id: number;
  user_id: number;
  tariff_id: number;
  status: string; // 'active' | 'expired' | 'cancelled'
  start_date: Date;
  end_date: Date;
  invite_link?: string;
  product_type: string;
  reminder_7_sent: boolean;
  reminder_3_sent: boolean;
  reminder_1_sent: boolean;
}

export interface BotPayment {
  id: number;
  user_id: number;
  product_type: string;
  product_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  photo_file_id?: string;
  invoice_id?: string;
  admin_message_id?: number;
  reviewed_by?: number;
  reviewed_at?: Date;
  telegram_charge_id?: string;
  provider_charge_id?: string;
  created_at: Date;
}

export interface BotSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
}

export interface BotContactMessage {
  id: number;
  user_id: number;
  message_text: string;
  photo_file_id?: string;
  is_read: boolean;
  created_at: Date;
}
