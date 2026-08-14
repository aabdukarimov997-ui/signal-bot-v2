'use client';

import { useEffect, useState } from 'react';
import { Bitcoin, Rocket, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────
   BTC Dominance (BTC.D) + Altcoin Season indeksi.
   Ma'lumot: /api/altseason (CoinGecko orqali serverda hisoblanadi).
   ──────────────────────────────────────────────────────────── */

interface PulseData {
  btcDominance: number;
  ethDominance: number;
  altseasonIndex: number | null;
  btcChange7d: number | null;
  altOutperformers: number;
  totalAlts: number;
  btcDomLabel: string;
  altseasonLabel: string;
  altseasonEmoji: string;
  altseasonColor: string;
  updatedAt: string;
  source: 'coingecko' | 'fallback';
}

export function MarketPulse({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [data, setData] = useState<PulseData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/altseason', {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error('altseason fetch failed');
        const d = (await res.json()) as PulseData;
        if (!cancelled) setData(d);
      } catch {
        /* server o'zi fallback qaytaradi; hech narsa qilmaymiz */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const d = data;
  const others = d ? Math.max(0, 100 - d.btcDominance - d.ethDominance) : 100;
  const btcUp = (d?.btcChange7d ?? 0) >= 0;
  const altColor = d?.altseasonColor ?? '#eab308';

  /* ── ixcham variant (bosh sahifa) ── */
  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f7931a]/10 border border-[#f7931a]/25">
            <Bitcoin className="size-5 text-[#f7931a]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              BTC Dominance
            </p>
            <p className="text-xs text-muted-foreground">
              {d ? d.btcDomLabel : 'Yuklanmoqda…'}
            </p>
          </div>
          <span className="font-display text-2xl font-bold tabular-nums text-[#f7931a]">
            {d ? `${d.btcDominance.toFixed(1)}%` : '—'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{
              backgroundColor: `${altColor}1a`,
              border: `1px solid ${altColor}33`,
            }}
          >
            {d?.altseasonEmoji ?? '⚖️'}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Altseason Indeksi
            </p>
            <p className="text-xs text-muted-foreground">
              {d ? d.altseasonLabel : 'Yuklanmoqda…'}
            </p>
          </div>
          <span
            className="font-display text-2xl font-bold tabular-nums"
            style={{ color: altColor }}
          >
            {d?.altseasonIndex === null || d?.altseasonIndex === undefined
              ? '—'
              : d.altseasonIndex}
          </span>
        </div>
      </div>
    );
  }

  /* ── to'liq variant (Market sahifasi) ── */
  return (
    <div className={cn('flex flex-col gap-7', className)}>
      {/* BTC Dominance */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#f7931a]/10 border border-[#f7931a]/25">
              <Bitcoin className="size-5 text-[#f7931a]" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground">
                BTC Dominance
              </h4>
              <p className="text-xs text-muted-foreground">
                Bitcoinning bozordagi ulushi (BTC.D)
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-display text-3xl font-extrabold tabular-nums text-[#f7931a] leading-none">
              {d ? `${d.btcDominance.toFixed(1)}%` : '—'}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {d ? d.btcDomLabel : 'Yuklanmoqda…'}
            </span>
          </div>
        </div>

        {/* bozor ulushi taqsimoti: BTC / ETH / boshqalar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="h-full bg-[#f7931a]"
            style={{ width: `${d ? d.btcDominance : 50}%` }}
            title="BTC"
          />
          <div
            className="h-full bg-[#627eea]"
            style={{ width: `${d ? d.ethDominance : 10}%` }}
            title="ETH"
          />
          <div
            className="h-full bg-muted-foreground/25"
            style={{ width: `${others}%` }}
            title="Boshqa altlar"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#f7931a]" /> BTC{' '}
              {d ? d.btcDominance.toFixed(1) : '—'}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#627eea]" /> ETH{' '}
              {d ? d.ethDominance.toFixed(1) : '—'}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground/25" />{' '}
              Boshqalar {others.toFixed(1)}%
            </span>
          </div>
          {d?.btcChange7d !== null && d?.btcChange7d !== undefined && (
            <span
              className={cn(
                'flex items-center gap-1 font-semibold tabular-nums',
                btcUp ? 'text-emerald' : 'text-destructive'
              )}
            >
              {btcUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              BTC 7 kun: {btcUp ? '+' : ''}
              {d.btcChange7d}%
            </span>
          )}
        </div>
      </div>

      {/* Altcoin Season */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-xl text-xl"
              style={{
                backgroundColor: `${altColor}1a`,
                border: `1px solid ${altColor}33`,
              }}
            >
              {d?.altseasonEmoji ?? '⚖️'}
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Altcoin Season Indeksi
              </h4>
              <p className="text-xs text-muted-foreground">
                Top altlarning BTC&apos;dan kuchli o&apos;sishi (7 kun)
              </p>
            </div>
          </div>
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${altColor}1a`,
              color: altColor,
              border: `1px solid ${altColor}33`,
            }}
          >
            {d?.altseasonLabel ?? 'Yuklanmoqda…'}
          </span>
        </div>

        {/* gauge: bitcoin (to'q sariq) → altseason (yashil) */}
        <div
          className="relative h-3.5 w-full rounded-full"
          style={{
            background:
              'linear-gradient(to right, #f7931a 0%, #eab308 40%, #84cc16 70%, #22c55e 100%)',
          }}
        >
          <div
            className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.5)] ring-2 ring-foreground/20"
            style={{
              left: `${d?.altseasonIndex === null || d?.altseasonIndex === undefined ? 50 : d.altseasonIndex}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
          <span>Bitcoin season</span>
          <span>50/50</span>
          <span>Altseason</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Rocket className="size-3.5" />
          <span>
            {d
              ? d.altseasonIndex === null
                ? 'Ma&apos;lumot yetarli emas'
                : `7 kun ichida BTC'dan kuchli altlar: ${d.altOutperformers}/${d.totalAlts} (${d.altseasonIndex})`
              : 'Yuklanmoqda…'}
          </span>
        </div>
      </div>

      {d && (
        <p className="text-xs text-muted-foreground/80">
          Yangilandi: {new Date(d.updatedAt).toLocaleTimeString('uz-UZ')} ·{' '}
          {d.source === 'coingecko' ? 'CoinGecko' : 'keshlangan ma&apos;lumot'}
        </p>
      )}
    </div>
  );
}
