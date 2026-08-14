import { create } from 'zustand';

export type PageId = string;

export type PayProductType = 'signal' | 'course';

interface NavigationState {
  currentPage: PageId;
  previousPage: PageId | null;
  /** #/pay/signal yoki #/pay/course — alohida to'lov sahifasi parametrlari */
  payProductType: PayProductType;
  payTariffId: string | null;
  navigate: (page: PageId) => void;
  goBack: () => void;
  navigateToPay: (productType: PayProductType, tariffId?: string | null) => void;
  /** Hash'ni parslab sahifani o'rnatadi (#/vip, #/pay/signal/{id}, ...) */
  applyHash: (hash: string) => void;
}

function setHash(hash: string) {
  if (typeof window === 'undefined') return;
  if (window.location.hash !== hash) {
    try {
      window.history.pushState(null, '', hash);
    } catch {
      // noop
    }
  }
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  previousPage: null,
  payProductType: 'signal',
  payTariffId: null,

  navigate: (page) => {
    // Har bir sahifa o'z URL'iga ega: #/vip, #/course, #/blog, ...
    setHash(`#/${page}`);
    set((state) => ({
      currentPage: page,
      previousPage: state.currentPage,
      // Menyudan "To'lov" bosilsa — toza signal to'lov sahifasi ochiladi
      ...(page === 'pay'
        ? { payProductType: 'signal' as PayProductType, payTariffId: null }
        : {}),
    }));
  },

  goBack: () =>
    set((state) => ({
      currentPage: state.previousPage || 'home',
      previousPage: null,
    })),

  navigateToPay: (productType, tariffId = null) => {
    const base = `#/pay/${productType}`;
    setHash(tariffId ? `${base}/${tariffId}` : base);
    set((state) => ({
      currentPage: 'pay',
      previousPage: state.currentPage,
      payProductType: productType,
      payTariffId: tariffId,
    }));
  },

  applyHash: (hash) => {
    if (!hash || hash === '#' || hash === '#/') {
      set({ currentPage: 'home', payTariffId: null });
      return;
    }
    const raw = hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const first = parts[0] || 'home';
    // #/pay/signal/{tarifId} yoki #/pay/course/{tarifId}
    if (first === 'pay' && parts.length >= 2) {
      const productType: PayProductType =
        parts[1] === 'course' ? 'course' : 'signal';
      set({
        currentPage: 'pay',
        payProductType: productType,
        payTariffId: parts[2] || null,
      });
      return;
    }
    set({ currentPage: first, payTariffId: null });
  },
}));

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  } | null;
  isLoading: boolean;
  login: (user: { id: string; email: string; name: string; role: 'USER' | 'ADMIN' }) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface UIState {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  isSearchOpen: false,
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
}));

const BG_STORAGE_KEY = 'aaa-background';

function readBackgroundId(): string {
  if (typeof window === 'undefined') return 'classic';
  try {
    return localStorage.getItem(BG_STORAGE_KEY) || 'classic';
  } catch {
    return 'classic';
  }
}

interface BackgroundState {
  backgroundId: string;
  isPickerOpen: boolean;
  setBackground: (id: string) => void;
  setPickerOpen: (open: boolean) => void;
}

export const useBackgroundStore = create<BackgroundState>((set) => ({
  backgroundId: readBackgroundId(),
  isPickerOpen: false,
  setBackground: (id) => {
    try {
      localStorage.setItem(BG_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    set({ backgroundId: id });
  },
  setPickerOpen: (isPickerOpen) => set({ isPickerOpen }),
}));

const THEME_STORAGE_KEY = 'aaa-theme';

type ThemeMode = 'system' | 'light' | 'dark';

function readThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

interface ThemeState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readThemeMode(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },
}));