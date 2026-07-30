'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore, type TmaTariff } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame, DecorativeDivider, GeometricBg } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function SignalsPage() {
  const { navigate, user, subscription, setSubscription, setSelectedTariff } = useTmaStore();
  const { t } = useLang();
  const [tariffs, setTariffsLocal] = useState<TmaTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTariff, setSelected] = useState<TmaTariff | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tariffData, subData] = await Promise.all([
          api.getTariffs('signal'),
          user ? api.getSubscription(user.id, 'signal') : Promise.resolve({ subscription: null }),
        ]);
        setTariffsLocal(tariffData.tariffs);
        if (subData.subscription) {
          setSubscription(subData.subscription);
        }
      } catch (err) {
        console.error('Failed to load signals data:', err);
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

  // If already subscribed
  if (subscription && subscription.productType === 'signal' && subscription.status === 'active') {
    return (
      <div className="px-4 pt-4">
        <NationalFrame>
          <div className="text-center py-4">
            <span className="text-4xl block mb-3">✅</span>
            <h2 className="text-lg font-semibold text-[#2dd4a0] mb-2">{t('already_subscribed')}</h2>
            <p className="text-sm text-[#7c7b7b] mb-1">{t('subscription_status')}: {t('status_active')}</p>
            <p className="text-sm text-[#7c7b7b]">{t('expiry_date')}: {new Date(subscription.endDate).toLocaleDateString()}</p>
            <button
              onClick={() => navigate('account')}
              className="mt-4 px-6 py-2 rounded-xl bg-[#d4a72c]/10 text-[#d4a72c] text-sm border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20 transition-all"
            >
              {t('account_title')}
            </button>
          </div>
        </NationalFrame>
      </div>
    );
  }

  // Payment method selection
  if (showPayment && selectedTariff) {
    const paymentMethods = [
      { id: 'stars', icon: '⭐', labelKey: 'pay_stars' },
      { id: 'card', icon: '💳', labelKey: 'pay_card' },
    ];

    return (
      <div className="px-4 pt-4">
        <button onClick={() => setShowPayment(false)} className="text-sm text-[#d4a72c] mb-4 flex items-center gap-1">
          ← {t('back')}
        </button>
        
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-2">{selectedTariff.name}</h2>
          <p className="text-2xl font-bold text-center text-[#d4a72c] mb-4">
            ${selectedTariff.price} <span className="text-sm text-[#7c7b7b]">/ {selectedTariff.durationMonths} {t('months')}</span>
          </p>
          
          <h3 className="text-sm font-medium text-[#c0c0c0] mb-3">{t('payment_method')}:</h3>
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                onClick={() => {
                  if (pm.id === 'stars') {
                    // Stars payment flow
                    setSelectedTariff(selectedTariff);
                    navigate('payment');
                  } else {
                    // Card payment flow
                    setShowPayment(false);
                    setSelectedTariff(selectedTariff);
                    navigate('payment');
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all"
              >
                <span className="text-xl">{pm.icon}</span>
                <span className="text-sm">{t(pm.labelKey)}</span>
              </button>
            ))}
          </div>
        </NationalFrame>
      </div>
    );
  }

  // Tariff selection
  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-1">{t('signal_title')}</h2>
          <p className="text-xs text-[#7c7b7b] text-center mb-4">{t('signal_desc')}</p>
          
          <h3 className="text-sm font-medium text-[#c0c0c0] mb-3">{t('select_tariff')}:</h3>
          <div className="space-y-3">
            {tariffs.map((tariff) => (
              <button
                key={tariff.id}
                onClick={() => {
                  setSelected(tariff);
                  setShowPayment(true);
                }}
                className="w-full group"
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a72c]/20 to-[#8b5e3c]/20 flex items-center justify-center text-lg">
                      📈
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{tariff.name}</p>
                      <p className="text-xs text-[#7c7b7b]">{tariff.durationMonths} {t('months')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#d4a72c]">${tariff.price}</p>
                    <p className="text-[10px] text-[#7c7b7b]">{tariff.starsPrice} ⭐</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
