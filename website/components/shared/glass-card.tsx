'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  glowEmerald?: boolean;
  hover?: boolean;
  index?: number;
}

export function GlassCard({
  children,
  className,
  glow = false,
  glowEmerald = false,
  hover = false,
  index,
}: GlassCardProps) {
  const delay = index !== undefined ? index * 0.1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={
        hover
          ? {
              scale: 1.02,
              boxShadow: '0 0 30px rgba(45, 212, 160, 0.1)',
            }
          : undefined
      }
      className={cn(
        'glass-card p-6',
        glow && 'border-glow',
        glowEmerald && 'border-glow-emerald',
        hover && 'transition-shadow duration-300 cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}