'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store';
import LoginPage from '@/components/pages/login';
import { Loader2 } from 'lucide-react';

// Admin panel — alohida chunk sifatida yuklanadi (lazy loading)
const AdminPanel = dynamic(
  () => import('@/components/pages/admin'),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-gold" />
      </div>
    ),
  }
);

// localStorage'dan user'ni o'qish (persist'ga bog'liq bo'lmagan)
function readStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aaa-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const user = parsed?.state?.user ?? parsed?.user;
    if (!user) return null;
    return { ...user, role: user.role === 'ADMIN' ? 'ADMIN' : 'USER' };
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  // localStorage'dan o'qish va store'ni sinxronlash
  useEffect(() => {
    setHydrated(true);
    const stored = readStoredUser();
    if (stored && !useAuthStore.getState().user) {
      useAuthStore.setState({ user: stored });
    }
  }, []);

  if (!hydrated) {
    return null;
  }

  const activeUser = user || readStoredUser();

  // Login qilinmagan bo'lsa — avval login sahifasi
  if (!activeUser || activeUser.role !== 'ADMIN') {
    return <LoginPage />;
  }

  return <AdminPanel />;
}
