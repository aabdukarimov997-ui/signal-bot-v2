import type { TmaTariff, TmaSubscription, TmaPayment, TmaAdminStats, TmaUser } from './store';

const BASE = '/api/tma';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
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

  async getSubscription(userId: number, type: string = 'signal'): Promise<{ subscription: TmaSubscription | null }> {
    return fetchJSON(`${BASE}/subscription?userId=${userId}&type=${type}`);
  },

  async createPayment(data: {
    userId: number;
    productType: string;
    productId: number;
    amount: number;
    paymentMethod: string;
    photoFileId?: string;
  }): Promise<{ payment: any }> {
    return fetchJSON(`${BASE}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReferral(userId: number): Promise<{
    referralCode: string;
    referralCount: number;
    activeCount: number;
    bonusDays: number;
  }> {
    return fetchJSON(`${BASE}/referral?userId=${userId}`);
  },

  async getSettings(): Promise<{ settings: Record<string, string> }> {
    return fetchJSON(`${BASE}/settings`);
  },

  async sendContactMessage(userId: number, messageText: string): Promise<{ message: any }> {
    return fetchJSON(`${BASE}/contact`, {
      method: 'POST',
      body: JSON.stringify({ userId, messageText }),
    });
  },

  // Admin
  async getAdminPayments(): Promise<{ payments: TmaPayment[] }> {
    return fetchJSON(`${BASE}/admin/payments`);
  },

  async adminActionPayment(paymentId: number, action: 'approve' | 'reject', adminTelegramId: number) {
    return fetchJSON(`${BASE}/admin/payments`, {
      method: 'PUT',
      body: JSON.stringify({ paymentId, action, adminTelegramId }),
    });
  },

  async getAdminStats(): Promise<TmaAdminStats> {
    return fetchJSON(`${BASE}/admin/stats`);
  },
};
