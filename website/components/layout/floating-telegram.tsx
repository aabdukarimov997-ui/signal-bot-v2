'use client';

import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { TELEGRAM } from '@/lib/constants';

export function FloatingTelegram() {
  return (
    <motion.a
      href={TELEGRAM.BOT}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 1.5,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center size-14 rounded-full glass-emerald border-glow-emerald pb-[env(safe-area-inset-bottom)]"
      style={{ marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Open Telegram Bot"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(45, 212, 160, 0.5)',
            '0 0 0 14px rgba(45, 212, 160, 0)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full"
      />
      <Send className="relative size-5 text-emerald" />
    </motion.a>
  );
}