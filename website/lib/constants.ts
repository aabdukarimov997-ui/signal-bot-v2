export const TELEGRAM = {
  MARKETING_CHANNEL: 'https://t.me/abdullohtreydr',
  BOT: 'https://t.me/AT_analysis_bot',
  HELP: '@abdulloh1997ka',
} as const;

export const SITE = {
  NAME: 'AAA',
  FOUNDER: 'ABDULLOH',
  TAGLINE: 'CRYPTO | SPOT | STOCKS',
  DESCRIPTION: 'Premium Crypto Trading Academy va Signal Platformasi',
  URL: 'https://aaa-trading.academy',
} as const;

export const NAV_ITEMS = [
  { id: 'home', label: 'Bosh sahifa', icon: 'Home' },
  { id: 'course', label: 'Trading Haqiqati', icon: 'GraduationCap' },
  { id: 'signals', label: 'AT_analysis', icon: 'Activity' },
  { id: 'vip', label: 'VIP', icon: 'Crown' },
  { id: 'market', label: 'Market Analysis', icon: 'BarChart3' },
  { id: 'blog', label: 'Blog', icon: 'Newspaper' },
  { id: 'faq', label: 'FAQ', icon: 'HelpCircle' },
  { id: 'about', label: 'Biz haqimizda', icon: 'Info' },
  { id: 'contact', label: "Aloqa", icon: 'Mail' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { id: 'admin-users', label: 'Foydalanuvchilar', icon: 'Users' },
  { id: 'admin-courses', label: 'Kurslar', icon: 'GraduationCap' },
  { id: 'admin-signals', label: 'Signal', icon: 'Activity' },
  { id: 'admin-blog', label: 'Blog', icon: 'Newspaper' },
  { id: 'admin-seo', label: 'SEO', icon: 'Search' },
  { id: 'admin-media', label: 'Media', icon: 'Image' },
  { id: 'admin-analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'admin-payments', label: "To'lovlar", icon: 'CreditCard' },
  { id: 'admin-referrals', label: 'Referral', icon: 'Share2' },
  { id: 'admin-banners', label: 'Bannerlar', icon: 'Layout' },
  { id: 'admin-pricing', label: 'Narxlar', icon: 'DollarSign' },
  { id: 'admin-coupons', label: 'Kuponlar', icon: 'Ticket' },
  { id: 'admin-telegram', label: 'Telegram', icon: 'Send' },
] as const;

export const CRYPTO_TICKERS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'GRAMUSDT'] as const;

export const COURSE_TIERS = ['starter', 'professional', 'master'] as const;
export const SIGNAL_TIERS = ['monthly', 'quarterly', 'semiannual'] as const;

export type CourseTier = (typeof COURSE_TIERS)[number];
export type SignalTier = (typeof SIGNAL_TIERS)[number];
export type PageId = (typeof NAV_ITEMS)[number]['id'] | (typeof ADMIN_NAV_ITEMS)[number]['id'] | 'login' | 'dashboard';