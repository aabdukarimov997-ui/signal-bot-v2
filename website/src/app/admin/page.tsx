'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import AdminPanel from '@/components/pages/admin';
import LoginPage from '@/components/pages/login';

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
