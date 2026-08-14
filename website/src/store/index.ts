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