import { create } from 'zustand';
import type { Lang } from './i18n';

export type TmaPage =
  | 'home'
  | 'signals'
  | 'courses'
  | 'account'
  | 'referral'
  | 'social'
  | 'help'
  | 'contact'
  | 'admin'
  | 'admin-payments'
  | 'admin-tariffs'
  | 'admin-users'
  | 'admin-stats'
  | 'admin-settings'
  | 'admin-messages'
  | 'admin-diagnostic'
  | 'payment'
  | 'login';

export interface TmaUser {
  id: number;
  telegramId: string;
  fullName: string;
  username?: string;
  isBanned: boolean;
  isAdmin: boolean;
  referralBonusDays: number;
  referralCount: number;
}

export interface TmaTariff {
  id: number;
  name: string;
  durationMonths: number;
  price: number;
  starsPrice: number;
  isActive: boolean;
  productType: string;
}

export interface TmaSubscription {
  id: number;
  tariffId: number;
  tariffName: string;
  status: string;
  startDate: string;
  endDate: string;
  inviteLink?: string;
  productType: string;
  daysLeft: number;
}

export interface TmaPayment {
  id: number;
  userId: number;
  productType: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  photoFileId?: string;
  createdAt: string;
  userName?: string;
  tariffName?: string;
}

export interface TmaAdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingPayments: number;
  totalReferrals: number;
}

interface TmaState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  currentPage: TmaPage;
  navigate: (page: TmaPage) => void;
  goBack: () => void;
  pageHistory: TmaPage[];
  
  // Auth
  user: TmaUser | null;
  initData: string;
  setInitData: (data: string) => void;
  setUser: (user: TmaUser | null) => void;
  
  // Telegram WebApp
  tgWebApp: any;
  setTgWebApp: (app: any) => void;
  
  // UI
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Data
  tariffs: TmaTariff[];
  subscription: TmaSubscription | null;
  payments: TmaPayment[];
  adminStats: TmaAdminStats | null;
  setTariffs: (tariffs: TmaTariff[]) => void;
  setSubscription: (sub: TmaSubscription | null) => void;
  setPayments: (payments: TmaPayment[]) => void;
  setAdminStats: (stats: TmaAdminStats | null) => void;
  
  // Selected tariff for payment
  selectedTariff: TmaTariff | null;
  setSelectedTariff: (tariff: TmaTariff | null) => void;
}

export const useTmaStore = create<TmaState>((set) => ({
  lang: 'uz',
  setLang: (lang) => set({ lang }),
  currentPage: 'home',
  navigate: (page) => set((s) => ({ 
    currentPage: page, 
    pageHistory: [...s.pageHistory, s.currentPage] 
  })),
  goBack: () => set((s) => ({
    currentPage: s.pageHistory.length > 0 ? s.pageHistory[s.pageHistory.length - 1] : 'home',
    pageHistory: s.pageHistory.slice(0, -1),
  })),
  pageHistory: [],
  
  user: null,
  initData: '',
  setInitData: (initData) => set({ initData }),
  setUser: (user) => set({ user }),
  
  tgWebApp: null,
  setTgWebApp: (app) => set({ tgWebApp: app }),
  
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  
  tariffs: [],
  subscription: null,
  payments: [],
  adminStats: null,
  setTariffs: (tariffs) => set({ tariffs }),
  setSubscription: (subscription) => set({ subscription }),
  setPayments: (payments) => set({ payments }),
  setAdminStats: (adminStats) => set({ adminStats }),
  
  selectedTariff: null,
  setSelectedTariff: (tariff) => set({ selectedTariff: tariff }),
}));
