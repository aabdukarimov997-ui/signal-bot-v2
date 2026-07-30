'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore, type TmaTariff } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function CoursesPage() {
  const { navigate, user, subscription, setSubscription } = useTmaStore();
  const { t } = useLang();
  const [tariffs, setTariffs] = useState<TmaTariff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tariffData, subData] = await Promise.all([
          api.getTariffs('course'),
          user ? api.getSubscription(user.id, 'course') : Promise.resolve({ subscription: null }),
        ]);
        setTariffs(tariffData.tariffs);
        if (subData.subscription) setSubscription(subData.subscription);
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

  if (subscription?.productType === 'course' && subscription.status === 'active') {
    return (
      <div className="px-4 pt-4">
        <NationalFrame>
          <div className="text-center py-4">
            <span className="text-4xl block mb-3">📚</span>
            <h2 className="text-lg font-semibold text-[#2dd4a0] mb-2">{t('already_subscribed')}</h2>
            <p className="text-sm text-[#7c7b7b]">{t('expiry_date')}: {new Date(subscription.endDate).toLocaleDateString()}</p>
          </div>
        </NationalFrame>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-1">{t('courses_title')}</h2>
          <p className="text-xs text-[#7c7b7b] text-center mb-4">{t('courses_desc')}</p>
          
          {tariffs.length === 0 ? (
            <p className="text-center text-sm text-[#7c7b7b] py-4">{t('not_found')}</p>
          ) : (
            <div className="space-y-3">
              {tariffs.map((tariff) => (
                <button
                  key={tariff.id}
                  className="w-full group"
                >
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2dd4a0]/20 to-[#1a9e76]/20 flex items-center justify-center text-lg">
                        📚
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{tariff.name}</p>
                        <p className="text-xs text-[#7c7b7b]">{tariff.durationMonths} {t('months')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2dd4a0]">${tariff.price}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </NationalFrame>
      </motion.div>
    </div>
  );
}
