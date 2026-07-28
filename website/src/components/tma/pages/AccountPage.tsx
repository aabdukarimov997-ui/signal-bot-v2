'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame, DecorativeDivider } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function AccountPage() {
  const { user, subscription, navigate, setSubscription } = useTmaStore();
  const { t, lang } = useLang();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [signalSub, courseSub] = await Promise.all([
          api.getSubscription(user.id, 'signal'),
          api.getSubscription(user.id, 'course'),
        ]);
        if (signalSub.subscription) setSubscription(signalSub.subscription);
        else if (courseSub.subscription) setSubscription(courseSub.subscription);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, setSubscription]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4a72c]/30 border-t-[#d4a72c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-4">{t('account_title')}</h2>
          
          {/* User info */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-[#ffffff08]">
              <span className="text-sm text-[#7c7b7b]">{t('full_name')}</span>
              <span className="text-sm font-medium">{user?.fullName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#ffffff08]">
              <span className="text-sm text-[#7c7b7b]">{t('telegram_id')}</span>
              <span className="text-sm font-mono text-[#d4a72c]">{user?.telegramId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#ffffff08]">
              <span className="text-sm text-[#7c7b7b]">{t('referral_count')}</span>
              <span className="text-sm font-medium">{user?.referralCount || 0}</span>
            </div>
          </div>

          <DecorativeDivider />

          {/* Subscription info */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[#c0c0c0] mb-2">{t('subscription_status')}</h3>
            {subscription && subscription.status === 'active' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7c7b7b]">{t('status')}</span>
                  <span className="text-sm font-medium text-[#2dd4a0]">✅ {t('status_active')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7c7b7b]">{t('expiry_date')}</span>
                  <span className="text-sm font-medium">
                    {new Date(subscription.endDate).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7c7b7b]">{t('duration')}</span>
                  <span className="text-sm font-medium">{subscription.tariffName}</span>
                </div>
                {subscription.daysLeft > 0 && subscription.daysLeft <= 7 && (
                  <div className="mt-2 p-2 rounded-lg bg-[#d4a72c]/10 border border-[#d4a72c]/20 text-center">
                    <p className="text-xs text-[#d4a72c]">
                      ⏳ {subscription.daysLeft} {t('duration')} {t('subscription_expired').replace('❌ ', '')}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => navigate('signals')}
                  className="w-full mt-3 py-2 rounded-xl bg-[#d4a72c]/10 text-[#d4a72c] text-sm border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20 transition-all"
                >
                  {t('extend_subscription')}
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#7c7b7b] mb-1">{t('no_subscription')}</p>
                <p className="text-xs text-[#5a5a5a]">{t('signal_desc')}</p>
                <button
                  onClick={() => navigate('signals')}
                  className="mt-3 px-6 py-2 rounded-xl bg-[#d4a72c]/10 text-[#d4a72c] text-sm border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20 transition-all"
                >
                  {t('subscribe')}
                </button>
              </div>
            )}
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
