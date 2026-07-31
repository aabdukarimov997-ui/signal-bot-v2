import { create } from 'zustand';

export type PageId = string;

interface NavigationState {
  currentPage: PageId;
  previousPage: PageId | null;
  navigate: (page: PageId) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'home',
  previousPage: null,
  navigate: (page) =>
    set((state) => ({
      currentPage: page,
      previousPage: state.currentPage,
    })),
  goBack: () =>
    set((state) => ({
      currentPage: state.previousPage || 'home',
      previousPage: null,
    })),
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
