'use client';

import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { TELEGRAM } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TelegramButtonsProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function TelegramButtons({
  variant = 'full',
  className,
}: TelegramButtonsProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <motion.a
          href={TELEGRAM.MARKETING_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="glass-card flex items-center justify-center size-10 text-silver hover:text-white transition-colors"
          aria-label="Join Telegram Channel"
        >
          <Send className="size-4" />
        </motion.a>
        <motion.a
          href={TELEGRAM.BOT}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="glass-card flex items-center justify-center size-10 text-silver hover:text-white transition-colors"
          aria-label="Open Telegram Bot"
        >
          <Send className="size-4" />
        </motion.a>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <motion.a
        href={TELEGRAM.MARKETING_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(34, 158, 217, 0.2)' }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all"
        style={{ backgroundColor: '#229ED9' }}
      >
        <Send className="size-4" />
        <span>Join Telegram Channel</span>
      </motion.a>
      <motion.a
        href={TELEGRAM.BOT}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(192, 192, 192, 0.12)' }}
        whileTap={{ scale: 0.97 }}
        className="glass-card inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-medium text-silver hover:text-white transition-colors"
      >
        <Send className="size-4" />
        <span>Open Telegram Bot</span>
      </motion.a>
    </div>
  );
}