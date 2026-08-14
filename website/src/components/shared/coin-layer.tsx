'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { hexToRgba } from '@/lib/backgrounds';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────
   Tangalar qatlami — fon ostida suzib yuruvchi BTC/ETH/SOL/TON/XRP
   logolari (spothq/cryptocurrency-icons + cryptologos, MIT litsenziyasi).
   ──────────────────────────────────────────────────────────── */

interface CoinGlyph {
  d: string;
  opacity?: number;
}

interface CoinDef {
  id: string;
  label: string;
  color: string;
  glyphColor: string;
  glyphOpacity: number;
  discAlpha: number;
  viewBox: string;
  cx: number;
  cy: number;
  r: number;
  glyphs: CoinGlyph[];
  pos: string;
  size: string;
  /* asosiy burilish (gradus) */
  rotate: number;
  /* skroll parallax chuqurligi — katta = skroll bilan ko'proq harakat */
  depth: number;
  delay: string;
  hide?: string;
}

const COINS: CoinDef[] = [
  {
    id: 'btc',
    label: 'BTC',
    color: '#F7931A',
    glyphColor: '#F7931A',
    glyphOpacity: 0.9,
    discAlpha: 0.2,
    viewBox: '0 0 32 32',
    cx: 16,
    cy: 16,
    r: 16,
    glyphs: [
      {
        d: 'M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z',
      },
    ],
    pos: 'left-[5%] top-[15%]',
    size: 'size-24 sm:size-36',
    rotate: -12,
    depth: 0.06,
    delay: '0s',
  },
  {
    id: 'eth',
    label: 'ETH',
    color: '#627EEA',
    glyphColor: '#627EEA',
    glyphOpacity: 0.9,
    discAlpha: 0.2,
    viewBox: '0 0 32 32',
    cx: 16,
    cy: 16,
    r: 16,
    glyphs: [
      { d: 'M16.498 4v8.87l7.497 3.35z', opacity: 0.602 },
      { d: 'M16.498 4L9 16.22l7.498-3.35z' },
      { d: 'M16.498 21.968v6.027L24 17.616z', opacity: 0.602 },
      { d: 'M16.498 27.995v-6.028L9 17.616z' },
      { d: 'M16.498 20.573l7.497-4.353-7.497-3.348z', opacity: 0.2 },
      { d: 'M9 16.22l7.498 4.353v-7.701z', opacity: 0.602 },
    ],
    pos: 'right-[7%] top-[20%]',
    size: 'size-20 sm:size-28',
    rotate: 6,
    depth: 0.04,
    delay: '0.8s',
    hide: 'hidden sm:block',
  },
  {
    id: 'sol',
    label: 'SOL',
    color: '#66F9A1',
    glyphColor: '#0b0f19',
    glyphOpacity: 0.75,
    discAlpha: 0.22,
    viewBox: '0 0 32 32',
    cx: 16,
    cy: 16,
    r: 16,
    glyphs: [
      {
        d: 'M9.925 19.687a.59.59 0 01.415-.17h14.366a.29.29 0 01.207.497l-2.838 2.815a.59.59 0 01-.415.171H7.294a.291.291 0 01-.207-.498l2.838-2.815zm0-10.517A.59.59 0 0110.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.59.59 0 01-.415.17H7.294a.291.291 0 01-.207-.497L9.925 9.17zm12.15 5.225a.59.59 0 00-.415-.17H7.294a.291.291 0 00-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 00.207-.498l-2.838-2.815z',
      },
    ],
    pos: 'left-[14%] top-[52%]',
    size: 'size-16 sm:size-24',
    rotate: -6,
    depth: 0.08,
    delay: '1.6s',
  },
  {
    id: 'ton',
    label: 'TON',
    color: '#0098EA',
    glyphColor: '#0098EA',
    glyphOpacity: 0.9,
    discAlpha: 0.2,
    viewBox: '0 0 56 56',
    cx: 28,
    cy: 28,
    r: 28,
    glyphs: [
      {
        d: 'M37.6,15.6H18.4c-3.5,0-5.7,3.8-4,6.9l11.8,20.5c0.8,1.3,2.7,1.3,3.5,0l11.8-20.5 C43.3,19.4,41.1,15.6,37.6,15.6L37.6,15.6z M26.3,36.8l-2.6-5l-6.2-11.1c-0.4-0.7,0.1-1.6,1-1.6h7.8L26.3,36.8L26.3,36.8z M38.5,20.7l-6.2,11.1l-2.6,5V19.1h7.8C38.4,19.1,38.9,20,38.5,20.7z',
      },
    ],
    pos: 'right-[12%] top-[55%]',
    size: 'size-20 sm:size-28',
    rotate: 10,
    depth: 0.03,
    delay: '2.2s',
    hide: 'hidden md:block',
  },
  {
    id: 'xrp',
    label: 'XRP',
    color: '#23292F',
    glyphColor: '#FFFFFF',
    glyphOpacity: 0.9,
    discAlpha: 0.4,
    viewBox: '0 0 32 32',
    cx: 16,
    cy: 16,
    r: 16,
    glyphs: [
      {
        d: 'M23.07 8h2.89l-6.015 5.957a5.621 5.621 0 01-7.89 0L6.035 8H8.93l4.57 4.523a3.556 3.556 0 004.996 0L23.07 8zM8.895 24.563H6l6.055-5.993a5.621 5.621 0 017.89 0L26 24.562h-2.895L18.5 20a3.556 3.556 0 00-4.996 0l-4.61 4.563z',
      },
    ],
    pos: 'left-[38%] bottom-[8%]',
    size: 'size-20 sm:size-28',
    rotate: -3,
    depth: 0.07,
    delay: '1.2s',
    hide: 'hidden sm:block',
  },
];

function Coin({ coin, scrollY }: { coin: CoinDef; scrollY: number }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute z-0 opacity-80', coin.pos, coin.hide)}
      style={{ transform: `translate3d(0, ${(scrollY * coin.depth).toFixed(1)}px, 0)` }}
    >
      <div
        className={cn('animate-coin', coin.size)}
        style={
          {
            animationDelay: coin.delay,
            '--coin-base': `${coin.rotate}deg`,
          } as CSSProperties
        }
      >
        {/* yumshoq porlash */}
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: hexToRgba(coin.color, 0.16) }}
        />
        <svg viewBox={coin.viewBox} className="relative h-full w-full drop-shadow-lg">
          <circle
            cx={coin.cx}
            cy={coin.cy}
            r={coin.r}
            fill={hexToRgba(coin.color, coin.discAlpha)}
            stroke={hexToRgba(coin.color, 0.35)}
            strokeWidth={1}
          />
          {coin.glyphs.map((g, i) => (
            <path
              key={i}
              d={g.d}
              fill={coin.glyphColor}
              fillOpacity={g.opacity ?? coin.glyphOpacity}
              fillRule="evenodd"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export function CoinLayer() {
  const [scrollY, setScrollY] = useState(0);
  const raf = useRef<number>(0);

  /* skroll bilan tangalar turli tezlikda siljiydi (parallax).
     reduced-motion'da parallax o'chadi. */
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    const update = () => {
      ticking = false;
      setScrollY(reduced ? 0 : window.scrollY);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf.current = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {COINS.map((c) => (
        <Coin key={c.id} coin={c} scrollY={scrollY} />
      ))}
    </>
  );
}
