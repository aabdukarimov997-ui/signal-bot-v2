'use client';

import { useAuthStore } from '@/store';
import AdminPanel from '@/components/pages/admin';
import LoginPage from '@/components/pages/login';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);

  // Login qilinmagan bo'lsa — avval login sahifasi
  if (!user || user.role !== 'ADMIN') {
    return <LoginPage />;
  }

  return <AdminPanel />;
}
