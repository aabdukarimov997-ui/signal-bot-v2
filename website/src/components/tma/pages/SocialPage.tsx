'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';

export function SocialPage() {
  const { t } = useLang();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://aaa-abdulloh-8ecf.up.railway.app';

  const links = [
    { icon: '📷', labelKey: 'instagram', url: 'https://instagram.com/abdulloh_treydr', color: 'from-[#833ab4] to-[#fd1d1d]' },
    { icon: '▶️', labelKey: 'youtube', url: 'https://youtube.com/@abdulloh_treydr', color: 'from-[#ff0000] to-[#cc0000]' },
    { icon: '🐦', labelKey: 'twitter', url: 'https://x.com/abdulloh_treydr', color: 'from-[#1da1f2] to-[#0d8bd9]' },
    { icon: '🌐', labelKey: 'website', url: siteUrl, color: 'from-[#d4a72c] to-[#8b5e3c]' },
    { icon: '📢', labelKey: 'free_channel', url: 'https://t.me/Mexc_Kucoin_Bitget', color: 'from-[#2dd4a0] to-[#1a9e76]' },
  ];

  return (
    <div className="px-4 pt-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-4">{t('social_title')}</h2>
          
          <div className="space-y-2">
            {links.map((link) => (
              <a
                key={link.labelKey}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08] hover:border-[#d4a72c]/20 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} bg-opacity-20 flex items-center justify-center text-lg`}>
                  {link.icon}
                </div>
                <span className="flex-1 text-sm group-hover:text-[#d4a72c] transition-colors">
                  {t(link.labelKey)}
                </span>
                <svg className="w-4 h-4 text-[#7c7b7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
