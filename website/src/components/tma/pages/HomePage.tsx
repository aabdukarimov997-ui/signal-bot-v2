'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame, DecorativeDivider, GeometricBg } from '../shared/UzbekPattern';

export function HomePage() {
  const { navigate, user } = useTmaStore();
  const { t } = useLang();

  const services = [
    { id: 'signals', icon: '📈', titleKey: 'signals_title', descKey: 'signals_desc', gradient: 'from-[#0f2b1f] to-[#1a3a2a]' },
    { id: 'courses', icon: '📚', titleKey: 'courses_title', descKey: 'courses_desc', gradient: 'from-[#1a0f0a] to-[#2d1a0f]' },
  ];

  const quickActions = [
    { id: 'account', icon: '👤', label: 'nav_account', color: '#d4a72c' },
    { id: 'referral', icon: '👥', label: 'nav_referral', color: '#2dd4a0' },
    { id: 'social', icon: '🌐', label: 'nav_social', color: '#7c7b7b' },
    { id: 'help', icon: '☎️', label: 'nav_help', color: '#c0c0c0' },
  ];

  return (
    <div className="relative px-4 pt-4 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#d4a72c] to-[#8b5e3c] p-[2px]">
            <Image
              src="/founder.jpg"
              alt="AAA Asoschisi — Abdulloh Abdukarim"
              width={80}
              height={80}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-[#f0d78c] via-[#d4a72c] to-[#8b5e3c] bg-clip-text text-transparent">
          {t('welcome_subtitle')}
        </h1>
        
        {user && (
          <p className="text-sm text-[#7c7b7b] mb-1">
            {user.fullName}
          </p>
        )}
        
        <p className="text-xs text-[#5a5a5a] uppercase tracking-widest">
          CRYPTO | SPOT | STOCKS
        </p>
      </motion.div>

      <DecorativeDivider />

      {/* Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-sm font-semibold text-[#c0c0c0] mb-3 px-1">
          {t('our_services')}
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => navigate(service.id as 'signals' | 'courses')}
              className="relative overflow-hidden group"
            >
              <NationalFrame>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl`}>
                    {service.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-[#fdfcfc] group-hover:text-[#d4a72c] transition-colors">
                      {t(service.titleKey)}
                    </h3>
                    <p className="text-xs text-[#7c7b7b] mt-0.5">
                      {t(service.descKey)}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[#d4a72c]/40 group-hover:text-[#d4a72c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </NationalFrame>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-sm font-semibold text-[#c0c0c0] mb-3 px-1">
          {t('nav_more')}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.id as any)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all group"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-[10px] text-[#7c7b7b] group-hover:text-[#d4a72c] transition-colors text-center">
                {t(action.label)}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bottom Decorative Text */}
      <div className="text-center mt-8">
        <p className="text-[10px] text-[#5a5a5a] italic">
          — {t('app_name')} —
        </p>
      </div>
    </div>
  );
}
