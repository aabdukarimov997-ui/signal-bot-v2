'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';

const METHODS = [
  { id: 'card', label: 'UZCARD / HUMO', icon: '💳' },
  { id: 'visa', label: 'Visa karta', icon: '💳' },
  { id: 'tron_trc20', label: 'TRON TRC20 (USDT)', icon: '🪙' },
  { id: 'bnb', label: 'BNB BEP20 (USDT)', icon: '🪙' },
  { id: 'toncoin', label: 'TON (USDT)', icon: '💎' },
];

export function PaymentPage() {
  const { selectedTariff, navigate, user } = useTmaStore();
  const { t } = useLang();
  const [method, setMethod] = useState<'stars' | 'card' | null>(null);
  const [cardMethod, setCardMethod] = useState('card');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/tma/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {});
  }, []);

  const cardDetails = () => {
    switch (cardMethod) {
      case 'visa':
        return {
          number: settings.visa_card_number || settings.card_number || '',
          holder: settings.visa_card_holder || settings.card_owner || '',
        };
      case 'tron_trc20':
        return { number: settings.ton_wallet_address || '', holder: 'TRON TRC20 (USDT)' };
      case 'bnb':
        return { number: settings.bnb_wallet_address || '', holder: 'BNB BEP20 (USDT)' };
      case 'toncoin':
        return { number: settings.toncoin_wallet_address || '', holder: 'TON (USDT)' };
      default:
        return { number: settings.card_number || '', holder: settings.card_owner || '' };
    }
  };

  const isMethodReady = (id: string) => {
    switch (id) {
      case 'visa':
        return Boolean(settings.visa_card_number || settings.card_number);
      case 'tron_trc20':
        return Boolean(settings.ton_wallet_address);
      case 'bnb':
        return Boolean(settings.bnb_wallet_address);
      case 'toncoin':
        return Boolean(settings.toncoin_wallet_address);
      default:
        return Boolean(settings.card_number);
    }
  };

  // ── Stars: invoice mini app ichida ochiladi ──
  const handleStarsPayment = async () => {
    if (!selectedTariff) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/tma/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tariffId: selectedTariff.id }),
      });
      const data = await res.json();
      if (!data.invoiceUrl) throw new Error(data.error || 'Invoice yaratilmadi');

      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg && typeof tg.openInvoice === 'function') {
        const status = await tg.openInvoice(data.invoiceUrl);
        if (status === 'paid') {
          setDone(true);
        } else {
          setError(t('pay_cancelled'));
          setProcessing(false);
        }
      } else {
        window.open(data.invoiceUrl, '_blank');
        setDone(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Xatolik yuz berdi');
      setProcessing(false);
    }
  };

  // ── Card: to'lov qildim → pending → admin tasdiqlaydi (bot'ga o'tmaydi) ──
  const handleCardPayment = async () => {
    if (!selectedTariff || !user) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/tma/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productType: selectedTariff.productType || 'signal',
          productId: selectedTariff.id,
          amount: selectedTariff.price,
          paymentMethod: cardMethod,
          photoFileId: null,
        }),
      });
      const data = await res.json();
      if (!data.payment) throw new Error(data.error || 'Xatolik yuz berdi');
      setDone(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Xatolik yuz berdi');
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
    <div className="px-4 pt-4 pb-8">
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

          {method === null && (
            <div className="space-y-2">
              <button
                onClick={() => setMethod('stars')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a72c]/20 to-[#f0d78c]/20 flex items-center justify-center text-lg">
                  ⭐
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t('pay_stars')}</p>
                  <p className="text-xs text-[#7c7b7b]">{selectedTariff.starsPrice} Stars — darhol faollashadi</p>
                </div>
                <svg className="w-5 h-5 text-[#d4a72c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => setMethod('card')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#2dd4a0]/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2dd4a0]/20 to-[#1a9e76]/20 flex items-center justify-center text-lg">
                  💳
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{t('pay_card')}</p>
                  <p className="text-xs text-[#7c7b7b]">Karta / USDT — admin tasdiqlaydi</p>
                </div>
                <svg className="w-5 h-5 text-[#2dd4a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {method === 'stars' && (
            <div className="space-y-3">
              <p className="text-xs text-[#7c7b7b] text-center">
                {selectedTariff.starsPrice} ⭐ Telegram Stars. To'lovni tasdiqlang — obuna darhol faollashadi.
              </p>
              <button
                onClick={handleStarsPayment}
                disabled={processing}
                className={`w-full py-3 rounded-xl bg-[#d4a72c] text-black font-semibold transition-all ${
                  processing ? 'opacity-50' : 'hover:bg-[#e8c14a]'
                }`}
              >
                {processing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    ...
                  </span>
                ) : (
                  `${selectedTariff.starsPrice} ⭐ To'lash`
                )}
              </button>
              <button
                onClick={() => setMethod(null)}
                disabled={processing}
                className="w-full py-2 text-xs text-[#7c7b7b]"
              >
                ← {t('back')}
              </button>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3">
              <p className="text-xs text-[#7c7b7b] text-center mb-2">To'lov usulini tanlang:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {METHODS.filter((m) => isMethodReady(m.id)).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCardMethod(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      cardMethod === m.id
                        ? 'bg-[#d4a72c]/20 border-[#d4a72c]/40 text-[#d4a72c]'
                        : 'bg-[#0a0a09] border-[#ffffff08] text-[#7c7b7b]'
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-[#0a0a09] border border-[#ffffff08] p-4 space-y-1">
                <p className="text-[11px] text-[#7c7b7b] uppercase tracking-wide">{cardDetails().holder}</p>
                <p className="text-sm font-mono break-all">{cardDetails().number}</p>
                <button
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(cardDetails().number);
                  }}
                  className="text-[11px] text-[#d4a72c]"
                >
                  📋 Nusxalash
                </button>
              </div>

              <p className="text-[11px] text-[#7c7b7b] text-center">
                To'lovni amalga oshirib, quyidagi tugmani bosing. Admin tekshirib tasdiqlaydi — obuna va kanalga havola
                shu Telegram akkauntingizga ulanadi.
              </p>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleCardPayment}
                disabled={processing}
                className={`w-full py-3 rounded-xl bg-[#2dd4a0] text-black font-semibold transition-all ${
                  processing ? 'opacity-50' : 'hover:bg-[#3ee6b2]'
                }`}
              >
                {processing ? 'Yuborilmoqda...' : "✅ To'lov qildim"}
              </button>
              <button
                onClick={() => setMethod(null)}
                disabled={processing}
                className="w-full py-2 text-xs text-[#7c7b7b]"
              >
                ← {t('back')}
              </button>
            </div>
          )}
        </NationalFrame>
      </motion.div>
    </div>
  );
}
