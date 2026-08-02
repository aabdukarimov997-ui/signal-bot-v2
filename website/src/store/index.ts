import { create } from 'zustand';

export type PageId = string;
export type PayProductType = 'signal' | 'course';

interface NavigationState {
  currentPage: PageId;
  previousPage: PageId | null;
  blogPostSlug: string | null;
  payProductType: PayProductType;
  navigate: (page: PageId) => void;
  navigateToPost: (slug: string) => void;
  navigateToPay: (productType?: PayProductType) => void;
  goBack: () => void;
}

/** Sahifa ID → URL hash (#signals, #course, #blog-post/slug, ...) */
export function pageToHash(page: PageId, slug?: string | null): string {
  if (page === 'blog-post') return `#blog-post/${slug ?? ''}`;
  return `#${page}`;
}

/** URL hash → sahifa ID + slug + to'lov turi */
export function parseHash(hash: string): {
  page: PageId;
  slug: string | null;
  payProductType: PayProductType;
} {
  const cleaned = hash.replace(/^#\/?/, '');
  const [first, second] = cleaned.split('/');
  if (first === 'blog-post') {
    return { page: 'blog-post', slug: second || null, payProductType: 'signal' };
  }
  if (first === 'pay') {
    return {
      page: 'pay',
      slug: null,
      payProductType: second === 'course' ? 'course' : 'signal',
    };
  }
  return { page: first || 'home', slug: null, payProductType: 'signal' };
}

/** Hash ni store bilan sinxronlashtiruvchi router (clientda bir marta ishga tushiriladi) */
let hashRouterInitialized = false;

export function initHashRouter() {
  // StrictMode'da effect ikki marta ishlaydi — listener'ni bir marta ulaymiz
  if (typeof window === 'undefined' || hashRouterInitialized) return;
  hashRouterInitialized = true;

  const syncFromHash = (isInit = false) => {
    const { page, slug, payProductType } = parseHash(window.location.hash);
    useNavigationStore.setState((state) => ({
      currentPage: page,
      previousPage: isInit ? state.previousPage : state.currentPage,
      blogPostSlug: slug,
      payProductType,
    }));
  };

  syncFromHash(true);
  window.addEventListener('hashchange', () => syncFromHash());
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentPage: 'home',
  previousPage: null,
  blogPostSlug: null,
  payProductType: 'signal',
  navigate: (page) => {
    if (typeof window === 'undefined') {
      set((state) => ({ currentPage: page, previousPage: state.currentPage }));
      return;
    }
    const hash = pageToHash(page);
    if (window.location.hash === hash) {
      // Hash o'zgarmasa — store'ni to'g'ridan-to'g'ri yangilaymiz
      set((state) => ({ currentPage: page, previousPage: state.currentPage }));
    } else {
      // Hash o'zgarsa — hashchange hodisasi store'ni sinxronlaydi
      window.location.hash = hash;
    }
  },
  navigateToPost: (slug) => {
    if (typeof window === 'undefined') {
      set((state) => ({
        currentPage: 'blog-post',
        previousPage: state.currentPage,
        blogPostSlug: slug,
      }));
      return;
    }
    const hash = `#blog-post/${slug}`;
    if (window.location.hash === hash) {
      set((state) => ({
        currentPage: 'blog-post',
        previousPage: state.currentPage,
        blogPostSlug: slug,
      }));
    } else {
      window.location.hash = hash;
    }
  },
  navigateToPay: (productType = 'signal') => {
    const hash = `#pay/${productType}`;
    if (typeof window === 'undefined') {
      set((state) => ({
        currentPage: 'pay',
        previousPage: state.currentPage,
        payProductType: productType,
      }));
      return;
    }
    if (window.location.hash === hash) {
      set((state) => ({
        currentPage: 'pay',
        previousPage: state.currentPage,
        payProductType: productType,
      }));
    } else {
      window.location.hash = hash;
    }
  },
  goBack: () => {
    const target = get().previousPage || 'home';
    get().navigate(target);
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

/* ───── Theme Store (kunduzgi/kechgi rejim) ───── */
type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('aaa-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    // Foydalanuvchi tizim sozlamasiga qarab
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  }
  return 'dark';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('aaa-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aaa-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),
}));
