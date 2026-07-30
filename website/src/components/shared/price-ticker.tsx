'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
}

const SYMBOLS = [
  { id: 'BTCUSDT', name: 'BTC', display: 'BTC/USD' },
  { id: 'ETHUSDT', name: 'ETH', display: 'ETH/USD' },
  { id: 'SOLUSDT', name: 'SOL', display: 'SOL/USD' },
  { id: 'TONUSDT', name: 'TON', display: 'TON/USD' },
  { id: 'BNBUSDT', name: 'BNB', display: 'BNB/USD' },
];

export function PriceTicker({ className }: { className?: string }) {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const symbols = SYMBOLS.map(s => `"${s.id}"`).join(',');
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`,
        { next: { revalidate: 30 } }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      const priceMap: Record<string, CryptoPrice> = {};
      for (const item of data) {
        priceMap[item.symbol] = {
          symbol: item.symbol,
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChange),
          changePercent24h: parseFloat(item.priceChangePercent),
          high24h: parseFloat(item.highPrice),
          low24h: parseFloat(item.lowPrice),
        };
      }
      setPrices(priceMap);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchPrices]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center gap-6 py-3', className)}>
        {SYMBOLS.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{s.name}</span>
            <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error || Object.keys(prices).length === 0) {
    return null; // silently hide on error
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden border-b border-glass-border bg-[#0a0a09]/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 sm:gap-8 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        {SYMBOLS.map((s) => {
          const p = prices[s.id];
          if (!p) return null;

          const isUp = p.changePercent24h > 0;
          const isDown = p.changePercent24h < 0;
          const color = isUp ? 'text-emerald' : isDown ? 'text-red-400' : 'text-muted-foreground';
          const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex shrink-0 items-center gap-2"
            >
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {s.name}
              </span>
              <span className="text-sm font-mono font-medium text-foreground">
                ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={cn('flex items-center gap-0.5 text-xs font-medium', color)}>
                <Icon className="size-3" />
                {Math.abs(p.changePercent24h).toFixed(2)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Compact variant (for small screens / sidebar) ───── */
export function PriceTickerCompact({ className }: { className?: string }) {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ids = SYMBOLS.map(s => `"${s.id}"`).join(',');
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbols=[${ids}]`
        );
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const map: Record<string, CryptoPrice> = {};
        for (const item of data) {
          map[item.symbol] = {
            symbol: item.symbol,
            price: parseFloat(item.price),
            change24h: 0,
            changePercent24h: 0,
            high24h: 0,
            low24h: 0,
          };
        }
        setPrices(map);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || Object.keys(prices).length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {SYMBOLS.map((s) => {
        const p = prices[s.id];
        if (!p) return null;
        return (
          <div key={s.id} className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{s.name}</span>
            <span className="text-xs font-mono font-medium text-foreground">
              ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
