'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore, formatTmaTariffDuration } from '@/lib/tma/store';
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
  const { selectedTariff, navigate, user, initData } = useTmaStore();
  const { t } = useLang();
  const [method, setMethod] = useState<'stars' | 'card' | 'crypto_pay' | null>(null);
  const [cardMethod, setCardMethod] = useState('card');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  // Avtomatik kripto to'lov holati (blokcheyndan tekshiriladi)
  const [cryptoInvoice, setCryptoInvoice] = useState<{
    paymentId: string;
    network: 'tron' | 'bnb';
    address: string;
    amount: number;
  } | null>(null);
  const [cryptoStatus, setCryptoStatus] = useState<'waiting' | 'paid'>('waiting');
  const [cryptoPayAvailable, setCryptoPayAvailable] = useState(false);
  const [cryptoPayInvoice, setCryptoPayInvoice] = useState<{
    paymentId: string;
    url: string;
    expiresAt?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/tma/settings')
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || {});
        setCryptoPayAvailable(Boolean(d.cryptoPayAvailable));
      })
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
        return { number: settings.tron_wallet_address || settings.ton_wallet_address || '', holder: 'TRON TRC20 (USDT)' };
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
        return Boolean(settings.tron_wallet_address || settings.ton_wallet_address);
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
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
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

  const isAutoCrypto = cardMethod === 'tron_trc20' || cardMethod === 'bnb';

  // ── Kripto: invoice yaratamiz → noyob summa → bot blokcheyndan tekshiradi ──
  const handleCryptoPayment = async () => {
    if (!selectedTariff || !user) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/tma/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
        body: JSON.stringify({
          productId: selectedTariff.id,
          paymentMethod: cardMethod,
          photoFileId: null,
        }),
      });
      const data = await res.json();
      if (!data.payment) throw new Error(data.error || 'Xatolik yuz berdi');
      if (!data.payment.autoVerify) throw new Error('Avtomatik tekshirish sozlanmagan');
      setCryptoInvoice({
        paymentId: data.payment.id,
        network: data.payment.cryptoNetwork,
        address: data.payment.cryptoAddress,
        amount: Number(data.payment.cryptoAmount),
      });
      setCryptoStatus('waiting');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Xatolik yuz berdi');
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoPayPayment = async () => {
    if (!selectedTariff || !user) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/tma/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
        body: JSON.stringify({ productId: selectedTariff.id, paymentMethod: 'crypto_pay' }),
      });
      const data = await res.json();
      if (!data.payment?.providerInvoiceUrl || !data.payment.id) throw new Error(data.error || 'Xatolik yuz berdi');
      const invoiceUrl = data.payment.providerInvoiceUrl;
      const parsed = new URL(invoiceUrl);
      if (parsed.protocol !== 'https:' || (parsed.hostname !== 't.me' && !parsed.hostname.endsWith('.crypt.bot'))) {
        throw new Error('Invoice havolasi noto\'g\'ri');
      }
      setCryptoPayInvoice({
        paymentId: data.payment.id,
        url: invoiceUrl,
        expiresAt: data.payment.cryptoExpiresAt,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Xatolik yuz berdi');
    } finally {
      setProcessing(false);
    }
  };

  // ── Kripto to'lov holatini polling qilish (avtomatik tasdiqlanishi) ──
  useEffect(() => {
    const paymentId = cryptoInvoice?.paymentId || cryptoPayInvoice?.paymentId;
    if (!paymentId || cryptoStatus === 'paid') return;
    let cancelled = false;
    let checking = false;
    const timer = setInterval(async () => {
      if (checking) return;
      checking = true;
      try {
        const res = await fetch(
          `/api/tma/payment/status?paymentId=${encodeURIComponent(paymentId)}`,
          { headers: { 'x-telegram-init-data': initData || '' } }
        );
        const data = await res.json();
        if (!cancelled && data?.payment?.status === 'approved') {
          setCryptoStatus('paid');
          setDone(true);
        } else if (!cancelled && ['failed', 'rejected', 'expired'].includes(data?.payment?.status)) {
          setError('To\'lov amalga oshmadi. Yangi invoice oching.');
          setCryptoInvoice(null);
          setCryptoPayInvoice(null);
        } else if (!cancelled && data?.payment?.cryptoExpiresAt && new Date(data.payment.cryptoExpiresAt).getTime() <= Date.now()) {
          setError('Invoice muddati tugagan. Yangi invoice oching.');
          setCryptoInvoice(null);
          setCryptoPayInvoice(null);
        }
      } catch {
        /* keyingi urinishda qayta tekshiriladi */
      } finally {
        checking = false;
      }
    }, 7000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [cryptoInvoice, cryptoPayInvoice, cryptoStatus, initData]);

  // ── Karta: to'lov qildim → pending → admin tasdiqlaydi ──
  const handleCardPayment = async () => {
    if (!selectedTariff || !user) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/tma/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
        body: JSON.stringify({
          productId: selectedTariff.id,
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
            {formatTmaTariffDuration(selectedTariff, t('months'))}
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
                  <p className="text-xs text-[#7c7b7b]">Karta to'lovi — admin tasdiqlaydi</p>
                </div>
                <svg className="w-5 h-5 text-[#2dd4a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {(isMethodReady('tron_trc20') || isMethodReady('bnb')) && (
                <button
                  onClick={() => {
                    setCardMethod(isMethodReady('tron_trc20') ? 'tron_trc20' : 'bnb');
                    setCryptoInvoice(null);
                    setCryptoPayInvoice(null);
                    setError('');
                    setMethod('card');
                  }}
                  className="w-full p-4 text-left rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#2dd4a0]/30"
                >
                  <p className="text-sm font-medium">Hamyon orqali bevosita USDT</p>
                  <p className="text-xs text-[#7c7b7b]">Provayder komissiyasiz. Tarmoq haqi bor. Blokcheyn tasdiqlaydi.</p>
                </button>
              )}

              {cryptoPayAvailable && (
                <button
                  onClick={() => setMethod('crypto_pay')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#d4a72c]/15 flex items-center justify-center text-sm font-bold text-[#d4a72c]">CP</div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Crypto Pay</p>
                    <p className="text-xs text-[#7c7b7b]">USDT — qulay to'lov, server tasdiqlaydi</p>
                  </div>
                  <svg className="w-5 h-5 text-[#d4a72c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
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
                    onClick={() => { setCardMethod(m.id); setCryptoInvoice(null); setCryptoStatus('waiting'); }}
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

              {cryptoInvoice ? (
                <>
                  <div className="rounded-xl bg-[#0a0a09] border border-[#d4a72c]/30 p-4 space-y-2">
                    <p className="text-[11px] text-[#7c7b7b] uppercase tracking-wide">
                      {cryptoInvoice.network === 'tron' ? 'TRON TRC20 (USDT)' : 'BNB BEP20 (USDT)'} — aniq summa
                    </p>
                    <p className="text-2xl font-bold text-[#d4a72c] font-mono">{cryptoInvoice.amount.toFixed(4)} USDT</p>
                    <p className="text-[11px] text-[#7c7b7b] uppercase tracking-wide pt-2">Wallet manzili</p>
                    <p className="text-sm font-mono break-all">{cryptoInvoice.address}</p>
                    <button
                      onClick={() => {
                        if (navigator.clipboard) navigator.clipboard.writeText(cryptoInvoice.address);
                      }}
                      className="text-[11px] text-[#d4a72c]"
                    >
                      📋 Manzilni nusxalash
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.clipboard) navigator.clipboard.writeText(cryptoInvoice.amount.toFixed(4));
                      }}
                      className="text-[11px] text-[#d4a72c] ml-3"
                    >
                      📋 Summani nusxalash
                    </button>
                  </div>

                  <p className="text-[11px] text-[#7c7b7b] text-center">
                    Yuqoridagi <b>aniq summani</b> o'zgartirmasdan yuboring. To'lov blokcheyndagi tranzaksiya orqali
                    avtomatik tekshiriladi va obuna avtomatik faollashadi (1-2 daqiqa).
                  </p>

                  {cryptoStatus === 'waiting' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#d4a72c]">
                      <span className="w-4 h-4 rounded-full border-2 border-[#d4a72c]/30 border-t-[#d4a72c] animate-spin" />
                      Blokcheyn tekshirilmoqda...
                    </div>
                  )}
                </>
              ) : (
                <>
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
                    {isAutoCrypto
                    ? "Direct USDT to'lovi avtomatik tekshiriladi — skrinshot yuborish shart emas. Networkni aynan ko'rsatilganidek tanlang."
                      : "To'lovni amalga oshirib, quyidagi tugmani bosing. Admin tekshirib tasdiqlaydi — obuna va kanalga havola shu Telegram akkauntingizga ulanadi."}
                  </p>
                  {isAutoCrypto && (
                    <div className="rounded-lg border border-[#ffffff08] bg-[#0a0a09] p-3 text-[11px] text-[#7c7b7b] space-y-1">
                      <p><b>Qo'llanma:</b> Send bo'limini oching, manzilni nusxalang, faqat {cardMethod === 'tron_trc20' ? 'TRON/TRC20' : 'BNB Smart Chain/BEP20'} networkni tanlang va summani o'zgartirmang.</p>
                      <p>Rasmiy walletlar: <a className="text-[#d4a72c]" href="https://trustwallet.com/" target="_blank" rel="noreferrer">Trust Wallet</a>, <a className="text-[#d4a72c]" href="https://www.tronlink.org/" target="_blank" rel="noreferrer">TronLink</a>.</p>
                      <p><b>Qonuniylik:</b> O'zbekistondagi amaldagi qonun, soliq va valyuta talablariga rioya qiling; faqat rasmiy/litsenziyalangan xizmatlardan foydalaning. Bu yuridik maslahat emas.</p>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

              {!cryptoInvoice && (
                <button
                  onClick={isAutoCrypto ? handleCryptoPayment : handleCardPayment}
                  disabled={processing}
                  className={`w-full py-3 rounded-xl bg-[#2dd4a0] text-black font-semibold transition-all ${
                    processing ? 'opacity-50' : 'hover:bg-[#3ee6b2]'
                  }`}
                >
                  {processing
                    ? 'Yuborilmoqda...'
                    : isAutoCrypto
                      ? "🔗 To'lovni boshlash"
                      : "✅ To'lov qildim"}
                </button>
              )}
              <button
                onClick={() => setMethod(null)}
                disabled={processing}
                className="w-full py-2 text-xs text-[#7c7b7b]"
              >
                ← {t('back')}
              </button>
            </div>
          )}

          {method === 'crypto_pay' && (
            <div className="space-y-3">
              <p className="text-xs text-[#7c7b7b] text-center">
                Crypto Pay orqali USDT. Provayderning amaldagi komissiyasi qo'llanishi mumkin.
                To'lashdan oldin invoice shartlarini tekshiring. To'lov tezligi kafolatlanmaydi.
              </p>
              <p className="text-[11px] text-[#7c7b7b] text-center">
                Qo'llanma: invoice'ni oching, USDT va networkni tekshiring, to'lovni faqat rasmiy CryptoBot oynasida tasdiqlang.
                O'zbekistondagi amaldagi qonun va soliq talablariga rioya qiling; bu yuridik maslahat emas.
              </p>
              {cryptoPayInvoice ? (
                <div className="rounded-xl bg-[#0a0a09] border border-[#d4a72c]/30 p-4 space-y-3 text-center">
                  <p className="text-sm font-medium">Invoice tayyor</p>
                  <a
                    href={cryptoPayInvoice.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-3 rounded-xl bg-[#d4a72c] text-black font-semibold hover:bg-[#e8c14a]"
                  >
                    Crypto Pay'da to'lash
                  </a>
                  <p className="text-[11px] text-[#7c7b7b]">Obuna faqat server to'lovni tasdiqlagandan keyin faollashadi.</p>
                </div>
              ) : (
                <button
                  onClick={handleCryptoPayPayment}
                  disabled={processing}
                  className={`w-full py-3 rounded-xl bg-[#d4a72c] text-black font-semibold transition-all ${processing ? 'opacity-50' : 'hover:bg-[#e8c14a]'}`}
                >
                  {processing ? 'Yuborilmoqda...' : 'Invoice ochish'}
                </button>
              )}
              {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}
              <button
                onClick={() => { setCryptoPayInvoice(null); setError(''); setMethod(null); }}
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
