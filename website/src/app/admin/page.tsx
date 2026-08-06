'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import AdminPanel from '@/components/pages/admin';
import LoginPage from '@/components/pages/login';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  // localStorage persist'dan user'ni o'qish (SSR hydration muammosi)
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  // Login qilinmagan bo'lsa — avval login sahifasi
  if (!user || user.role !== 'ADMIN') {
    return <LoginPage />;
  }

  return <AdminPanel />;
}
