'use client';

import { useEffect, useState } from 'react';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '@/components/tma/shared/LanguageProvider';
import { TmaNavigation } from '@/components/tma/Navigation';
import { TopOrnament, GeometricBg, DecorativeDivider } from '@/components/tma/shared/UzbekPattern';
import { HomePage } from '@/components/tma/pages/HomePage';
import { SignalsPage } from '@/components/tma/pages/SignalsPage';
import { CoursesPage } from '@/components/tma/pages/CoursesPage';
import { AccountPage } from '@/components/tma/pages/AccountPage';
import { ReferralPage } from '@/components/tma/pages/ReferralPage';
import { SocialPage } from '@/components/tma/pages/SocialPage';
import { HelpPage } from '@/components/tma/pages/HelpPage';
import { ContactPage } from '@/components/tma/pages/ContactPage';
import { AdminPage } from '@/components/tma/pages/AdminPage';
import { PaymentPage } from '@/components/tma/pages/PaymentPage';

export default function TmaApp() {
  const { currentPage, setUser, setInitData, setLoading, user } = useTmaStore();
  const { t, lang, setLang } = useLang();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'error'>('loading');

  useEffect(() => {
    async function initAuth() {
      try {
        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (tg) {
          const initData = tg.initData || '';
          tg.expand();
          tg.ready();
          setInitData(initData);

          if (initData) {
            const resp = await fetch('/api/tma/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData }),
            });
            const data = await resp.json();
            if (data.authenticated && data.user) {
              setUser(data.user);
              setAuthState('authenticated');
              return;
            }
          }
        }
        // If no Telegram WebApp, try localStorage for demo/dev
        const savedUser = localStorage.getItem('tma_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setAuthState('authenticated');
          return;
        }
        setAuthState('error');
      } catch (err) {
        console.error('Auth error:', err);
        setAuthState('error');
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [setUser, setInitData, setLoading]);

  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040303]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-[#d4a72c]/30 border-t-[#d4a72c] animate-spin" />
          <p className="text-[#7c7b7b]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#040303] p-6">
        <div className="text-center max-w-sm">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-lg font-semibold text-[#fdfcfc] mb-2">
            {t('error')}
          </h2>
          <p className="text-sm text-[#7c7b7b] mb-6">
            {t('error_description') || 'Iltimos, bot orqali Mini App ni oching'}
          </p>
          <p className="text-xs text-[#7c7b7b]">
            Open this app from Telegram Bot
          </p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'signals':
        return <SignalsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'account':
        return <AccountPage />;
      case 'referral':
        return <ReferralPage />;
      case 'social':
        return <SocialPage />;
      case 'help':
        return <HelpPage />;
      case 'contact':
        return <ContactPage />;
      case 'payment':
        return <PaymentPage />;
      case 'admin':
      case 'admin-payments':
      case 'admin-tariffs':
      case 'admin-users':
      case 'admin-stats':
      case 'admin-settings':
      case 'admin-messages':
      case 'admin-diagnostic':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <GeometricBg />
      <TopOrnament />

      {/* Lang Switcher */}
      <div className="fixed top-3 right-3 z-50 flex gap-1">
        {(['uz', 'en', 'ru'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-[10px] rounded-md transition-all ${
              lang === l
                ? 'bg-[#d4a72c]/20 text-[#d4a72c] border border-[#d4a72c]/30'
                : 'text-[#7c7b7b] hover:text-[#c0c0c0]'
            }`}
          >
            {l === 'uz' ? "O'zb" : l === 'en' ? 'Eng' : 'Рус'}
          </button>
        ))}
      </div>

      {renderPage()}
      <TmaNavigation />
    </div>
  );
}
