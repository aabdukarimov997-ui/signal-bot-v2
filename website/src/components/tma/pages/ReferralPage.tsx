'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function ReferralPage() {
  const { user } = useTmaStore();
  const { t } = useLang();
  const [referral, setReferral] = useState<{ referralCode: string; referralCount: number; activeCount: number; bonusDays: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await api.getReferral(user.id);
        setReferral(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleCopy = () => {
    if (!referral) return;
    const link = `https://t.me/AT_analysis_bot?start=${user?.telegramId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
          <h2 className="text-lg font-semibold text-center mb-1">{t('referral_title')}</h2>
          <p className="text-xs text-[#7c7b7b] text-center mb-4">{t('referral_desc')}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08] text-center">
              <p className="text-xl font-bold text-[#d4a72c]">{referral?.referralCount || 0}</p>
              <p className="text-[10px] text-[#7c7b7b]">{t('referral_count_label')}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08] text-center">
              <p className="text-xl font-bold text-[#2dd4a0]">{referral?.activeCount || 0}</p>
              <p className="text-[10px] text-[#7c7b7b]">{t('referral_active')}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0a0a09] border border-[#ffffff08] text-center">
              <p className="text-xl font-bold text-[#f0d78c]">+{referral?.bonusDays || 0}</p>
              <p className="text-[10px] text-[#7c7b7b]">{t('duration')}</p>
            </div>
          </div>

          {/* Referral link */}
          <div className="space-y-2">
            <p className="text-xs text-[#7c7b7b]">{t('referral_link')}:</p>
            <div className="flex gap-2">
              <div className="flex-1 p-2 rounded-lg bg-[#040303] border border-[#ffffff08] overflow-hidden">
                <p className="text-xs font-mono text-[#c0c0c0] truncate">
                  https://t.me/AT_analysis_bot?start={user?.telegramId}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  copied
                    ? 'bg-[#2dd4a0]/20 text-[#2dd4a0] border border-[#2dd4a0]/30'
                    : 'bg-[#d4a72c]/10 text-[#d4a72c] border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20'
                }`}
              >
                {copied ? '✓' : t('copy_link')}
              </button>
            </div>
          </div>

          {/* Bonus info */}
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#d4a72c]/5 to-[#2dd4a0]/5 border border-[#d4a72c]/10">
            <p className="text-xs text-[#c0c0c0]">
              💡 {t('referral_bonus')}
            </p>
          </div>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
