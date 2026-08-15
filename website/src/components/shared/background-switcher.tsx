'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check, Monitor, Sun, Moon } from 'lucide-react';
import { BACKGROUNDS, getBackground, hexToRgba, DISPLAY_FONTS, type BackgroundDef } from '@/lib/backgrounds';
import { useBackgroundStore, useThemeStore } from '@/store';
import { cn } from '@/lib/utils';

function previewGradient(b: BackgroundDef): string {
  return [
    `radial-gradient(ellipse 120% 100% at 30% 20%, ${hexToRgba(b.dark.c1, 0.55)} 0%, transparent 65%)`,
    `radial-gradient(ellipse 120% 100% at 80% 90%, ${hexToRgba(b.dark.c2, 0.55)} 0%, transparent 65%)`,
    '#0b0f19',
  ].join(', ');
}

export function BackgroundSwitcher() {
  const backgroundId = useBackgroundStore((s) => s.backgroundId);
  const isPickerOpen = useBackgroundStore((s) => s.isPickerOpen);
  const setBackground = useBackgroundStore((s) => s.setBackground);
  const setPickerOpen = useBackgroundStore((s) => s.setPickerOpen);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const current = getBackground(backgroundId);

  return (
    <>
      {/* tugma — katta, pastda, doim ko'rinib turadi */}
      <motion.button
        type="button"
        onClick={() => setPickerOpen(!isPickerOpen)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="glass-card fixed bottom-6 left-5 z-50 flex h-14 items-center gap-2 rounded-full border-glass-border px-5 shadow-lg shadow-black/10"
        style={{ marginBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Fon tanlash"
        title="Fon tanlash"
      >
        <Palette className="size-6 text-silver" />
        <span className="text-sm font-semibold text-silver">Fon</span>
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass-strong fixed bottom-32 left-3 z-50 max-h-[62vh] w-[320px] overflow-y-auto scrollbar-thin rounded-2xl p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Fon tanlang</h3>
                <p className="text-[11px] text-muted-foreground">
                  {BACKGROUNDS.length} ta variant — tanlovingiz saqlanadi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Yopish"
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {BACKGROUNDS.map((b) => {
                const active = b.id === backgroundId;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBackground(b.id)}
                    className={cn(
                      'group flex flex-col items-center gap-1 rounded-lg p-1.5 transition-colors',
                      active
                        ? 'bg-emerald/10 ring-1 ring-emerald/50'
                        : 'hover:bg-muted/40'
                    )}
                  >
                    <span
                      className="relative h-10 w-full overflow-hidden rounded-md border border-glass-border"
                      style={{ backgroundImage: previewGradient(b) }}
                    >
                      {active && (
                        <span className="absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full bg-emerald text-emerald-foreground">
                          <Check className="size-2.5" />
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'text-center text-[9px] leading-tight',
                        active
                          ? 'text-emerald'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      style={{ fontFamily: DISPLAY_FONTS[b.font]?.var ?? 'var(--font-display)' }}
                    >
                      {b.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-center gap-1 rounded-xl border border-glass-border bg-muted/20 p-1">
              {[
                { id: 'system' as const, label: 'Tizim', icon: Monitor },
                { id: 'light' as const, label: 'Kunduz', icon: Sun },
                { id: 'dark' as const, label: 'Tun', icon: Moon },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors',
                      active
                        ? 'bg-emerald text-emerald-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="size-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-center text-[10px] text-muted-foreground/70">
              Hozirgi:{' '}
              <span className="text-emerald">{current.label}</span>{' '}
              · Shrift:{' '}
              <span style={{ fontFamily: DISPLAY_FONTS[current.font]?.var ?? 'var(--font-display)' }}>
                {DISPLAY_FONTS[current.font]?.label ?? ''}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
