'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [dark, setDark] = useState(false);

  /* Tanlangan rejimni qo'llash + 'system' rejimida tizimni kuzatish */
  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const d =
        theme === 'dark' ? true : theme === 'light' ? false : mq.matches;
      html.classList.toggle('dark', d);
      setDark(d);
    };
    apply();
    if (theme === 'system') {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const toggle = () => {
    const html = document.documentElement;
    const currentDark = html.classList.contains('dark');
    setTheme(currentDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-label={dark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
      title={dark ? 'Kunduzgi rejim' : 'Tungi rejim'}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors',
        className
      )}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </motion.button>
  );
}
