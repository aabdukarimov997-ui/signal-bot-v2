'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore, type TmaAdminStats, type TmaPayment } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame, DecorativeDivider } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function AdminPage() {
  const { currentPage, navigate, user } = useTmaStore();
  const { t } = useLang();
  const [stats, setStats] = useState<TmaAdminStats | null>(null);
  const [payments, setPayments] = useState<TmaPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, paymentsData] = await Promise.all([
          api.getAdminStats(),
          api.getAdminPayments(),
        ]);
        setStats(statsData);
        setPayments(paymentsData.payments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className="px-4 pt-4">
        <NationalFrame>
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">⛔</span>
            <p className="text-sm text-[#7c7b7b]">Access denied</p>
          </div>
        </NationalFrame>
      </div>
    );
  }

  // Sub-pages
  if (currentPage === 'admin-payments') {
    return (
      <div className="px-4 pt-4">
        <button onClick={() => navigate('admin')} className="text-sm text-[#d4a72c] mb-4 flex items-center gap-1">
          ← {t('back')}
        </button>
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-4">{t('pending_payments')}</h2>
          {payments.length === 0 ? (
            <p className="text-center text-sm text-[#7c7b7b] py-4">{t('not_found')}</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{p.userName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'pending' ? 'bg-[#d4a72c]/10 text-[#d4a72c]' : ''
                    }`}>
                      {t('status_' + p.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[#7c7b7b]">{p.tariffName} — ${p.amount}</p>
                  <p className="text-xs text-[#5a5a5a]">{p.paymentMethod}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        await api.adminActionPayment(p.id, 'approve', Number(user.telegramId));
                        // Refresh
                        const pData = await api.getAdminPayments();
                        setPayments(pData.payments);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#2dd4a0]/10 text-[#2dd4a0] text-xs border border-[#2dd4a0]/20"
                    >
                      {t('approve')}
                    </button>
                    <button
                      onClick={async () => {
                        await api.adminActionPayment(p.id, 'reject', Number(user.telegramId));
                        const pData = await api.getAdminPayments();
                        setPayments(pData.payments);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20"
                    >
                      {t('reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NationalFrame>
      </div>
    );
  }

  // Main admin panel
  const menuItems = [
    { id: 'admin-payments', icon: '💳', label: t('admin_payments'), count: payments.filter(p => p.status === 'pending').length, color: '#d4a72c' },
    { id: 'admin-tariffs', icon: '📊', label: t('admin_tariffs'), color: '#2dd4a0' },
    { id: 'admin-users', icon: '👥', label: t('admin_users'), color: '#c0c0c0' },
    { id: 'admin-stats', icon: '📈', label: t('admin_stats'), color: '#f0d78c' },
    { id: 'admin-settings', icon: '⚙️', label: t('admin_settings'), color: '#7c7b7b' },
    { id: 'admin-messages', icon: '💬', label: t('admin_messages'), color: '#1da1f2' },
    { id: 'admin-diagnostic', icon: '📊', label: t('admin_diagnostic'), color: '#8b5e3c' },
  ];

  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Stats Overview */}
        {stats && (
          <NationalFrame>
            <h2 className="text-lg font-semibold text-center mb-3">{t('admin_stats')}</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08]">
                <p className="text-lg font-bold text-[#d4a72c]">{stats.totalUsers}</p>
                <p className="text-[10px] text-[#7c7b7b]">{t('total_users')}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08]">
                <p className="text-lg font-bold text-[#2dd4a0]">{stats.activeSubscriptions}</p>
                <p className="text-[10px] text-[#7c7b7b]">{t('active_subs')}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08]">
                <p className="text-lg font-bold text-[#f0d78c]">${stats.totalRevenue}</p>
                <p className="text-[10px] text-[#7c7b7b]">{t('total')} {t('total_revenue')}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08]">
                <p className="text-lg font-bold text-[#c0c0c0]">${stats.todayRevenue}</p>
                <p className="text-[10px] text-[#7c7b7b]">{t('today')} {t('total_revenue')}</p>
              </div>
            </div>
          </NationalFrame>
        )}

        <div className="h-4" />

        {/* Admin Menu */}
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-3">{t('admin_panel')}</h2>
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id as any)}
                className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all group"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-center text-[#7c7b7b] group-hover:text-[#d4a72c] transition-colors">
                  {item.label}
                </span>
                {'count' in item && item.count !== undefined && item.count > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#d4a72c] text-[10px] font-bold text-[#040303] flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
