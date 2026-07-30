'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTmaStore } from '@/lib/tma/store';
import { useLang } from '../shared/LanguageProvider';
import { NationalFrame } from '../shared/UzbekPattern';
import { api } from '@/lib/tma/api';

export function ContactPage() {
  const { user, navigate } = useTmaStore();
  const { t } = useLang();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!message.trim() || !user) return;
    setSending(true);
    setError('');
    try {
      await api.sendContactMessage(user.id, message.trim());
      setSent(true);
      setMessage('');
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="px-4 pt-4">
        <NationalFrame>
          <div className="text-center py-8">
            <span className="text-4xl block mb-3">✅</span>
            <h2 className="text-lg font-semibold text-[#2dd4a0] mb-2">{t('contact_sent')}</h2>
            <button
              onClick={() => navigate('home')}
              className="mt-4 px-6 py-2 rounded-xl bg-[#d4a72c]/10 text-[#d4a72c] text-sm border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20 transition-all"
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
        <button onClick={() => navigate('help')} className="text-sm text-[#d4a72c] mb-4 flex items-center gap-1">
          ← {t('back')}
        </button>
        
        <NationalFrame>
          <h2 className="text-lg font-semibold text-center mb-1">{t('contact_message')}</h2>
          <p className="text-xs text-[#7c7b7b] text-center mb-4">{t('contact_placeholder')}</p>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('contact_placeholder')}
            rows={5}
            className="w-full p-3 rounded-xl bg-[#040303] border border-[#ffffff15] text-sm text-[#fdfcfc] placeholder:text-[#5a5a5a] focus:outline-none focus:border-[#d4a72c]/30 resize-none transition-colors"
          />
          
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={`w-full mt-3 py-3 rounded-xl text-sm font-medium transition-all ${
              !message.trim() || sending
                ? 'bg-[#ffffff08] text-[#5a5a5a] cursor-not-allowed'
                : 'bg-[#d4a72c]/10 text-[#d4a72c] border border-[#d4a72c]/20 hover:bg-[#d4a72c]/20'
            }`}
          >
            {sending ? t('loading') : t('contact_message')}
          </button>
        </NationalFrame>
      </motion.div>
    </div>
  );
}
