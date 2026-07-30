'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';

export function HelpPage() {
  const { navigate } = useTmaStore();
  const { t } = useLang();

  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-1">{t('help_title')}</h2>
          <p className="text-xs text-[#7c7b7b] text-center mb-4">{t('help_desc')}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('contact')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a72c]/20 to-[#8b5e3c]/20 flex items-center justify-center text-lg">
                💬
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium group-hover:text-[#d4a72c] transition-colors">
                  {t('contact_message')}
                </p>
                <p className="text-xs text-[#7c7b7b]">{t('contact_placeholder')}</p>
              </div>
              <svg className="w-5 h-5 text-[#d4a72c]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <a
              href="https://t.me/abdulloh1997ka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1da1f2]/20 flex items-center justify-center text-lg">
                ✈️
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium group-hover:text-[#d4a72c] transition-colors">
                  {t('contact_admin')}
                </p>
                <p className="text-xs text-[#7c7b7b]">@abdulloh1997ka</p>
              </div>
              <svg className="w-5 h-5 text-[#7c7b7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
