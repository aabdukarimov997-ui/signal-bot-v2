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
      whileHover={{ scale: 1.1, rotate: -5 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center size-14 rounded-full glass-gold border-glow-gold pb-[env(safe-area-inset-bottom)]"
      style={{ marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Open Telegram Bot"
    >
      {/* Pulsing gold ring */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(212, 167, 44, 0.5)',
            '0 0 0 14px rgba(212, 167, 44, 0)',
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full"
      />
      {/* Decorative star in corner */}
      <div className="absolute -top-1 -right-1 size-3">
        <svg viewBox="0 0 12 12" className="text-gold/60">
          <polygon
            points="6,0 7,3 10,3 8,5 9,8 6,6 3,8 4,5 2,3 5,3"
            fill="currentColor"
          />
        </svg>
      </div>
      <Send className="relative size-5 text-gold" />
    </motion.a>
  );
}