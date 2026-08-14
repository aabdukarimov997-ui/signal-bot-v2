'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────
   Qo'rquv va Ochko'zlik indeksi (Fear & Greed Index).
   Ma'lumot: alternative.me (bepul API, kuniga 1 marta yangilanadi).
   ──────────────────────────────────────────────────────────── */

interface FngPoint {
  value: string;
  classification: string;
  timestamp: string;
}

const API = 'https://api.alternative.me/fng/?limit=30';

/* API ishlamasa ko'rsatiladigan oxirgi kuzatilgan qiymatlar */
const FALLBACK_HISTORY = [
  58, 60, 62, 61, 63, 65, 64, 66, 68, 67, 69, 70, 68, 66, 64, 62, 63, 65,
  67, 69, 71, 70, 72, 74, 73, 75, 76, 74, 72, 70,
];

function classify(v: number) {
  if (v <= 25) return { label: "Juda qo'rquv", emoji: '😨', color: '#f43f5e' };
  if (v < 45) return { label: "Qo'rquv", emoji: '😟', color: '#fb923c' };
  if (v < 55) return { label: 'Neytral', emoji: '😐', color: '#eab308' };
  if (v < 75) return { label: "Ochko'zlik", emoji: '😀', color: '#84cc16' };
  return { label: "Juda ochko'zlik", emoji: '🤑', color: '#22c55e' };
}

const GAUGE_GRADIENT =
  'linear-gradient(to right, #f43f5e 0%, #fb923c 25%, #eab308 45%, #84cc16 70%, #22c55e 100%)';

function Sparkline({
  history,
  color,
}: {
  history: number[];
  color: string;
}) {
  if (history.length < 2) return null;
  const W = 100;
  const H = 32;
  const PAD = 2;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const pts = history
    .map(
      (v, i) =>
        `${((i / (history.length - 1)) * W).toFixed(1)},${(
          H -
          PAD -
          ((v - min) / range) * (H - PAD * 2)
        ).toFixed(1)}`
    )
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-12 w-full"
      aria-hidden
    >
      <polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill={color}
        opacity={0.12}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function FearGreedIndex({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(API, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error('fng fetch failed');
        const data = (await res.json()) as { data?: FngPoint[] };
        if (cancelled || !Array.isArray(data.data) || data.data.length === 0) {
          return;
        }
        const list = data.data;
        const first = parseInt(list[0].value, 10);
        setValue(Number.isFinite(first) ? first : 50);
        setHistory(
          list
            .map((p) => parseInt(p.value, 10))
            .filter((n) => Number.isFinite(n))
            .reverse()
        );
        setUpdated(new Date());
        setOffline(false);
      } catch {
        if (!cancelled) {
          setValue(FALLBACK_HISTORY[FALLBACK_HISTORY.length - 1]);
          setHistory(FALLBACK_HISTORY);
          setOffline(true);
        }
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000); // har 5 daqiqada yangilash
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const c = classify(value ?? 50);
  const v = value ?? 50;

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
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: `${c.color}1a`, border: `1px solid ${c.color}33` }}
          >
            {c.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              Qo&apos;rquv va Ochko&apos;zlik
              {offline && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  offline
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {value === null
                ? 'Yuklanmoqda…'
                : `${c.label} · ${updated ? updated.toLocaleTimeString('uz-UZ') : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-2 w-36 overflow-hidden rounded-full sm:w-44" style={{ background: GAUGE_GRADIENT }}>
            <div
              className="absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_6px_rgba(0,0,0,0.4)]"
              style={{ left: `${v}%` }}
            />
          </div>
          <span
            className="font-display text-2xl font-bold tabular-nums"
            style={{ color: c.color }}
          >
            {value === null ? '—' : v}
          </span>
        </div>
      </div>
    );
  }

  /* ── to'liq variant (Market sahifasi) ── */
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald/10 border border-emerald/15">
            <Activity className="size-5 text-emerald" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">
              Qo&apos;rquv va Ochko&apos;zlik Indeksi
            </h4>
            <p className="text-xs text-muted-foreground">
              Kripto bozor kayfiyati (0 = qo&apos;rquv, 100 = ochko&apos;zlik)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${c.color}1a`, color: c.color, border: `1px solid ${c.color}33` }}
          >
            <span className="text-sm leading-none">{c.emoji}</span>
            {c.label}
          </span>
          {offline && (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              offline
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* katta qiymat */}
        <div className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:gap-0 sm:w-32">
          <span
            className="font-display text-6xl font-extrabold tabular-nums leading-none"
            style={{ color: c.color }}
          >
            {value === null ? '—' : v}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>

        {/* gauge */}
        <div className="flex-1">
          <div
            className="relative h-3.5 w-full rounded-full"
            style={{ background: GAUGE_GRADIENT }}
          >
            <div
              className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.5)] ring-2 ring-foreground/20"
              style={{ left: `${v}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            <span>Qo&apos;rquv</span>
            <span>Neytral</span>
            <span>Ochko&apos;zlik</span>
          </div>
        </div>
      </div>

      {/* 30 kunlik grafik */}
      {history.length >= 2 && (
        <div className="glass rounded-xl p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">So&apos;nggi 30 kun</span>
            <span className="text-muted-foreground tabular-nums">
              min {Math.min(...history)} · max {Math.max(...history)}
            </span>
          </div>
          <Sparkline history={history} color={c.color} />
        </div>
      )}

      {updated && (
        <p className="text-xs text-muted-foreground/80">
          Yangilandi: {updated.toLocaleDateString('uz-UZ')}{' '}
          {updated.toLocaleTimeString('uz-UZ')} · alternative.me
        </p>
      )}
    </div>
  );
}
