'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center size-9 rounded-lg transition-all duration-300',
        'text-muted-foreground hover:text-gold hover:bg-white/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
        className
      )}
      aria-label={isDark ? 'Kunduzgi rejimga o\'tish' : 'Kechgi rejimga o\'tish'}
      title={isDark ? 'Kunduzgi rejim' : 'Kechgi rejim'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute"
          >
            <Sun className="size-4" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute"
          >
            <Moon className="size-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: isDark
            ? ['0 0 0px rgba(212,167,44,0)', '0 0 12px rgba(212,167,44,0.15)', '0 0 0px rgba(212,167,44,0)']
            : ['0 0 0px rgba(184,134,11,0)', '0 0 12px rgba(184,134,11,0.12)', '0 0 0px rgba(184,134,11,0)'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </button>
  );
}