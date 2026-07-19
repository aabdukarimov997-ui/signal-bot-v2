export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  telegramId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  starterPrice: number;
  professionalPrice: number;
  masterPrice: number;
  starterFeatures: string;
  professionalFeatures: string;
  masterFeatures: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  semiannualPrice: number;
  monthlyFeatures: string;
  quarterlyFeatures: string;
  semiannualFeatures: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  type: 'COURSE' | 'SIGNAL';
  plan: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  telegramPaymentId?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  code: string;
  createdAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  eventData: string;
  ipAddress: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}