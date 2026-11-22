import type { TmaTariff, TmaSubscription, TmaPayment, TmaAdminStats, TmaUser } from './store';

const BASE = '/api/tma';

function getInitData(): string {
  if (typeof window === 'undefined') return '';
  try {
    // Telegram WebApp global (script orqali yuklanadi)
    return (window as any)?.Telegram?.WebApp?.initData || '';
  } catch {
    return '';
  }
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const initData = getInitData();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(initData ? { 'x-telegram-init-data': initData } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  async auth(initData: string): Promise<{ user: TmaUser; authenticated: boolean }> {
    return fetchJSON(`${BASE}/auth`, {
      method: 'POST',
      body: JSON.stringify({ initData }),
    });
  },

  async getTariffs(type: string = 'signal'): Promise<{ tariffs: TmaTariff[] }> {
    return fetchJSON(`${BASE}/tariffs?type=${type}`);
  },

  async getSubscription(userId: string, type: string = 'signal'): Promise<{ subscription: TmaSubscription | null }> {
    return fetchJSON(`${BASE}/subscription?userId=${userId}&type=${type}`);
  },

  async getSubscriptionHistory(): Promise<{ history: TmaSubscription[] }> {
    return fetchJSON(`${BASE}/subscription/history`);
  },

  async createPayment(data: {
    userId: string;
    productType: string;
    productId: string;
    amount: number;
    paymentMethod: string;
    photoFileId?: string;
  }): Promise<{
    payment: {
      id: string;
      status: string;
      cryptoNetwork?: 'tron' | 'bnb' | null;
      cryptoAddress?: string | null;
      cryptoAmount?: number | null;
      autoVerify?: boolean;
      cryptoPay?: boolean;
      providerInvoiceId?: string | null;
      providerInvoiceUrl?: string | null;
      cryptoExpiresAt?: string | null;
    };
  }> {
    return fetchJSON(`${BASE}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPaymentStatus(paymentId: string): Promise<{
    payment: {
      id: string;
      status: string;
      paymentMethod: string;
      cryptoNetwork?: string | null;
      cryptoAmount?: number | null;
      cryptoTxHash?: string | null;
      autoApproved: boolean;
      productType: string;
      amount: number;
      createdAt: string;
      cryptoExpiresAt?: string | null;
      providerInvoiceUrl?: string | null;
    };
  }> {
    return fetchJSON(`${BASE}/payment/status?paymentId=${encodeURIComponent(paymentId)}`);
  },

  async getReferral(userId: string): Promise<{
    referralCode: string;
    referralCount: number;
    activeCount: number;
    bonusDays: number;
  }> {
    return fetchJSON(`${BASE}/referral?userId=${userId}`);
  },

  async getSettings(): Promise<{ settings: Record<string, string>; cryptoPayAvailable: boolean }> {
    return fetchJSON(`${BASE}/settings`);
  },

  async sendContactMessage(userId: string, messageText: string): Promise<{ message: any }> {
    return fetchJSON(`${BASE}/contact`, {
      method: 'POST',
      body: JSON.stringify({ userId, messageText }),
    });
  },

  // Admin
  async getAdminPayments(): Promise<{ payments: TmaPayment[] }> {
    return fetchJSON(`${BASE}/admin/payments`);
  },

  async adminActionPayment(paymentId: string, action: 'approve' | 'reject', adminTelegramId: string) {
    return fetchJSON(`${BASE}/admin/payments`, {
      method: 'PUT',
      body: JSON.stringify({ paymentId, action, adminTelegramId }),
    });
  },

  async getAdminStats(): Promise<TmaAdminStats> {
    return fetchJSON(`${BASE}/admin/stats`);
  },
};
