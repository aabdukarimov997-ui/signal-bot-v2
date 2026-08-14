'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: number;
  change24h: number;
}

/* Fallback values used if the live API is unreachable */
const FALLBACK: TickerItem[] = [
  { symbol: 'BTC/USDT', price: 61245, change24h: 2.34 },
  { symbol: 'ETH/USDT', price: 3382, change24h: 1.87 },
  { symbol: 'SOL/USDT', price: 146.2, change24h: 4.12 },
  { symbol: 'TON/USDT', price: 7.14, change24h: -1.26 },
  { symbol: 'BNB/USDT', price: 578.9, change24h: 0.64 },
];

const PAIRS: Record<string, string> = {
  BTCUSDT: 'BTC/USDT',
  ETHUSDT: 'ETH/USDT',
  SOLUSDT: 'SOL/USDT',
  TONUSDT: 'TON/USDT',
  BNBUSDT: 'BNB/USDT',
};

async function fetchTickers(): Promise<TickerItem[]> {
  const symbols = Object.keys(PAIRS).map((s) => `"${s}"`).join(',');
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`,
    { signal: AbortSignal.timeout(6000) }
  );
  if (!res.ok) throw new Error('ticker fetch failed');
  const data: { symbol: string; lastPrice: string; priceChangePercent: string }[] =
    await res.json();
  return data.map((d) => ({
    symbol: PAIRS[d.symbol] ?? d.symbol,
    price: parseFloat(d.lastPrice),
    change24h: parseFloat(d.priceChangePercent),
  }));
}

function formatPrice(p: number): string {
  return p >= 1000
    ? p.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : p >= 1
      ? p.toFixed(2)
      : p.toFixed(4);
}

function TickerRow({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((t) => {
        const up = t.change24h >= 0;
        return (
          <div
            key={`${t.symbol}-${t.price}`}
            className="flex shrink-0 items-center gap-2.5 px-6"
          >
            <span className="text-sm font-semibold text-silver">{t.symbol}</span>
            <span className="text-sm font-medium tabular-nums text-foreground/90">
              ${formatPrice(t.price)}
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-semibold tabular-nums ${
                up ? 'text-emerald' : 'text-destructive'
              }`}
            >
              {up ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {up ? '+' : ''}
              {t.change24h.toFixed(2)}%
            </span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          </div>
        );
      })}
    </>
  );
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchTickers();
        if (!cancelled && data.length > 0) {
          setItems(data);
          setLive(true);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden border-y border-glass-border bg-card/60 backdrop-blur-sm">
      <div className="marquee-track py-2.5">
        <TickerRow items={items} />
        <TickerRow items={items} />
      </div>
      {/* edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent"
      />
      {live && (
        <span
          aria-hidden
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald/80 sm:flex"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald" />
          </span>
          Live
        </span>
      )}
    </div>
  );
}
