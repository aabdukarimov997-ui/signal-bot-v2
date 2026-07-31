'use client';

import { Logo } from '@/components/shared/logo';
import { TelegramButtons } from '@/components/shared/telegram-buttons';
import { Separator } from '@/components/ui/separator';
import { SamarkandStarPattern, SherDorArabesque, SherDorCorner, SherDorDivider } from '@/components/shared/sherdor-pattern';
import { useNavigationStore } from '@/store';
import { SITE, NAV_ITEMS, TELEGRAM } from '@/lib/constants';
import type { PageId } from '@/lib/constants';

const QUICK_LINKS = NAV_ITEMS.map((item) => ({
  id: item.id,
  label: item.label,
}));

const RESOURCE_LINKS: { id: PageId; label: string }[] = [
  { id: 'course', label: 'Course' },
  { id: 'signals', label: 'Signals' },
  { id: 'vip', label: 'VIP' },
  { id: 'market', label: 'Market Analysis' },
];

const LEGAL_LINKS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Privacy Policy' },
  { id: 'home', label: 'Terms of Service' },
];

export function Footer() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <footer className="relative mt-auto border-t border-glass-border overflow-hidden">
      {/* Samarqand Sher-Dor fon naqshlari */}
      <SamarkandStarPattern opacity={0.08} />
      <SherDorArabesque opacity={0.05} />
      {/* Samarqand burchak ornamentlari */}
      <SherDorCorner position="top-left" />
      <SherDorCorner position="top-right" />
      <SherDorCorner position="bottom-left" />
      <SherDorCorner position="bottom-right" />

      {/* Decorative gold top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Top Section */}
        <div className="py-12 sm:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm space-y-4">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <span className="text-lg font-bold text-gradient-oriental">{SITE.NAME}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {SITE.DESCRIPTION}
              </p>
              <TelegramButtons variant="full" />
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
              {/* Quick Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold/60" />
                  Quick Links
                </h3>
                <ul className="space-y-2.5">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.id}>
                      <button
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="text-sm text-muted-foreground hover:text-gold-light transition-colors group flex items-center gap-2"
                      >
                        <span className="size-1 rounded-full bg-gold/0 group-hover:bg-gold/50 transition-all duration-300" />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold/60" />
                  Resources
                </h3>
                <ul className="space-y-2.5">
                  {RESOURCE_LINKS.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="text-sm text-muted-foreground hover:text-gold-light transition-colors group flex items-center gap-2"
                      >
                        <span className="size-1 rounded-full bg-gold/0 group-hover:bg-gold/50 transition-all duration-300" />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold/60" />
                  Legal
                </h3>
                <ul className="space-y-2.5">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="text-sm text-muted-foreground hover:text-gold-light transition-colors group flex items-center gap-2"
                      >
                        <span className="size-1 rounded-full bg-gold/0 group-hover:bg-gold/50 transition-all duration-300" />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold/60" />
                  Connect
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href={TELEGRAM.MARKETING_CHANNEL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-gold-light transition-colors group flex items-center gap-2"
                    >
                      <span className="size-1 rounded-full bg-gold/0 group-hover:bg-gold/50 transition-all duration-300" />
                      Telegram Channel
                    </a>
                  </li>
                  <li>
                    <a
                      href={TELEGRAM.BOT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-gold-light transition-colors group flex items-center gap-2"
                    >
                      <span className="size-1 rounded-full bg-gold/0 group-hover:bg-gold/50 transition-all duration-300" />
                      Telegram Bot
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://t.me/${TELEGRAM.HELP.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-gold-light transition-colors group flex items-center gap-2"
                    >
                      <span className="size-1 rounded-full bg-gold/0 group-hover:bg-gold/50 transition-all duration-300" />
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <SherDorDivider variant="simple" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-3 py-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © 2025 {SITE.NAME} by {SITE.FOUNDER}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium tracking-[0.2em] text-gold/60">
              {SITE.TAGLINE}
            </p>
            <span className="size-1.5 rotate-45 bg-gold/30" />
          </div>
        </div>
      </div>
    </footer>
  );
}