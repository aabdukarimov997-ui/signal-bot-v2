'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/store';
import { cn } from '@/lib/utils';

const LOGO_SIZES = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
  hero: 180,
  '2xl': 220,
} as const;

type LogoSize = keyof typeof LOGO_SIZES;

interface LogoProps {
  size?: LogoSize;
  className?: string;
  showBackground?: boolean;
}

export function Logo({ size = 'md', className, showBackground = false }: LogoProps) {
  const navigate = useNavigationStore((s) => s.navigate);
  const dimension = LOGO_SIZES[size];
  const isLarge = size === 'hero' || size === '2xl';

  return (
    <motion.button
      type="button"
      onClick={() => navigate('home')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('relative inline-flex shrink-0', className)}
      aria-label="AAA - Bosh sahifa"
    >
      {showBackground && (
        <div
          className={cn(
            'absolute inset-0 rounded-3xl',
            isLarge ? 'rounded-[2rem]' : 'rounded-2xl',
          )}
          style={{
            background: isLarge
              ? 'radial-gradient(ellipse at center, rgba(45, 212, 160, 0.12) 0%, rgba(45, 212, 160, 0.04) 40%, rgba(10, 10, 9, 0.9) 100%)'
              : 'radial-gradient(ellipse at center, rgba(45, 212, 160, 0.1) 0%, rgba(10, 10, 9, 0.95) 100%)',
            border: '1px solid rgba(45, 212, 160, 0.15)',
            boxShadow: isLarge
              ? '0 0 60px rgba(45, 212, 160, 0.08), 0 0 120px rgba(45, 212, 160, 0.04), inset 0 1px 0 rgba(45, 212, 160, 0.1)'
              : '0 0 30px rgba(45, 212, 160, 0.06), inset 0 1px 0 rgba(45, 212, 160, 0.08)',
            padding: isLarge ? '2rem' : '1rem',
          }}
        />
      )}
      <Image
        src="/aaa-logo.png"
        alt="AAA Logo"
        width={dimension}
        height={dimension}
        priority={isLarge}
        className="object-contain relative z-10"
      />
    </motion.button>
  );
}