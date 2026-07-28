'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function PaymentPage() {
  const { selectedTariff, user, navigate, setSubscription } = useTmaStore();
  const { t } = useLang();
  const [method, setMethod] = useState<'stars' | 'card' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleStarsPayment = async () => {
    if (!user || !selectedTariff) return;
    setProcessing(true);
    try {
      // Try Telegram Stars via WebApp
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg) {
        // Send invoice via bot - open bot chat with message
        tg.openTelegramLink(`https://t.me/AT_analysis_bot?start=pay_stars_${selectedTariff.id}`);
      }
      
      // Create payment record
      await api.createPayment({
        userId: user.id,
        productType: 'signal',
        productId: selectedTariff.id,
        amount: selectedTariff.price,
        paymentMethod: 'stars',
      });
      
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!user || !selectedTariff) return;
    setProcessing(true);
    try {
      // Create pending payment (admin will approve)
      await api.createPayment({
        userId: user.id,
        productType: 'signal',
        productId: selectedTariff.id,
        amount: selectedTariff.price,
        paymentMethod: 'card',
      });
      
      // Open bot for card details + receipt upload
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.openTelegramLink(`https://t.me/AT_analysis_bot?start=pay_card_${selectedTariff.id}`);
      }
      
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedTariff) {
    return (
      <div className="px-4 pt-4">
        <NationalFrame>
          <div className="text-center py-8">
            <p className="text-sm text-[#7c7b7b]">{t('select_tariff')}</p>
            <button onClick={() => navigate('signals')} className="mt-4 text-[#d4a72c] text-sm">
              {t('back')}
            </button>
          </div>
        </NationalFrame>
      </div>
    );
  }

  if (done) {
    return (
      <div className="px-4 pt-4">
        <NationalFrame>
          <div className="text-center py-8">
            <span className="text-5xl block mb-4">✅</span>
            <h2 className="text-lg font-semibold text-[#2dd4a0] mb-2">
              {method === 'stars' ? t('stars_success') : t('receipt_sent')}
            </h2>
            <p className="text-xs text-[#7c7b7b] mb-4">{selectedTariff.name} - ${selectedTariff.price}</p>
            <button
              onClick={() => navigate('home')}
              className="px-6 py-2 rounded-xl bg-[#d4a72c]/10 text-[#d4a72c] text-sm border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20 transition-all"
            >
              {t('back')}
            </button>
          </div>
        </NationalFrame>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('signals')} className="text-sm text-[#d4a72c] mb-4 flex items-center gap-1">
          ← {t('back')}
        </button>

        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-2">{selectedTariff.name}</h2>
          <p className="text-3xl font-bold text-center text-[#d4a72c] mb-1">
            ${selectedTariff.price}
          </p>
          <p className="text-xs text-[#7c7b7b] text-center mb-6">
            {selectedTariff.durationMonths} {t('months')}
          </p>

          <div className="space-y-2">
            {/* Stars Payment */}
            <button
              onClick={() => { setMethod('stars'); handleStarsPayment(); }}
              disabled={processing}
              className={`w-full flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all ${
                processing ? 'opacity-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a72c]/20 to-[#f0d78c]/20 flex items-center justify-center text-lg">
                ⭐
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{t('pay_stars')}</p>
                <p className="text-xs text-[#7c7b7b]">{selectedTariff.starsPrice} Stars</p>
              </div>
              {processing && method === 'stars' ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#d4a72c]/30 border-t-[#d4a72c] animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-[#d4a72c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Card Payment */}
            <button
              onClick={() => { setMethod('card'); handleCardPayment(); }}
              disabled={processing}
              className={`w-full flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all ${
                processing ? 'opacity-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2dd4a0]/20 to-[#1a9e76]/20 flex items-center justify-center text-lg">
                💳
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{t('pay_card')}</p>
                <p className="text-xs text-[#7c7b7b]">{t('card_number')} / {t('card_holder')}</p>
              </div>
              {processing && method === 'card' ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#d4a72c]/30 border-t-[#d4a72c] animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-[#2dd4a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
