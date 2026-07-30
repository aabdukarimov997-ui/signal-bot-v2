'use client';

import { Logo } from '@/components/shared/logo';
import { TelegramButtons } from '@/components/shared/telegram-buttons';
import { Separator } from '@/components/ui/separator';
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
    <footer className="relative mt-auto border-t border-glass-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="py-12 sm:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm space-y-4">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {SITE.DESCRIPTION}
              </p>
              <TelegramButtons variant="full" />
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
              {/* Quick Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald">
                  Quick Links
                </h3>
                <ul className="space-y-2.5">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.id}>
                      <button
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald">
                  Resources
                </h3>
                <ul className="space-y-2.5">
                  {RESOURCE_LINKS.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald">
                  Legal
                </h3>
                <ul className="space-y-2.5">
                  {LEGAL_LINKS.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => navigate(link.id)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald">
                  Connect
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href={TELEGRAM.MARKETING_CHANNEL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Telegram Channel
                    </a>
                  </li>
                  <li>
                    <a
                      href={TELEGRAM.BOT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Telegram Bot
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://t.me/${TELEGRAM.HELP.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-glass-border" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-3 py-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © 2024 {SITE.NAME} by {SITE.FOUNDER}. All rights reserved.
          </p>
          <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground/60">
            {SITE.TAGLINE}
          </p>
        </div>
      </div>
    </footer>
  );
}