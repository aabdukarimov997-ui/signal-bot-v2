'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  GraduationCap,
  Activity,
  Crown,
  BarChart3,
  Newspaper,
  HelpCircle,
  User,
  MessageSquare,
  Lock,
  LayoutDashboard,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   TradingHeroDecor — per-page trading-styled hero background.
   Every variant has its own accent color + chart motif.
   ──────────────────────────────────────────────────────────── */

export type HeroVariant =
  | 'candles'
  | 'signals'
  | 'gold'
  | 'heatmap'
  | 'paper'
  | 'faq'
  | 'profile'
  | 'chat'
  | 'lock'
  | 'terminal';

const VARIANTS: Record<
  HeroVariant,
  { accent: string; glow: string; icon: LucideIcon; side: 'left' | 'right' }
> = {
  candles: { accent: '#2ee6a8', glow: 'rgba(46,230,168,0.13)', icon: GraduationCap, side: 'right' },
  signals: { accent: '#3ec9f5', glow: 'rgba(62,201,245,0.13)', icon: Activity, side: 'left' },
  gold: { accent: '#f5b93e', glow: 'rgba(245,185,62,0.14)', icon: Crown, side: 'right' },
  heatmap: { accent: '#7c8cf8', glow: 'rgba(124,140,248,0.14)', icon: BarChart3, side: 'right' },
  paper: { accent: '#8b93a7', glow: 'rgba(139,147,167,0.14)', icon: Newspaper, side: 'left' },
  faq: { accent: '#ff7ab8', glow: 'rgba(255,122,184,0.12)', icon: HelpCircle, side: 'right' },
  profile: { accent: '#f5a13e', glow: 'rgba(245,161,62,0.12)', icon: User, side: 'left' },
  chat: { accent: '#229ed9', glow: 'rgba(34,158,217,0.13)', icon: MessageSquare, side: 'right' },
  lock: { accent: '#2dd4bf', glow: 'rgba(45,212,191,0.12)', icon: Lock, side: 'left' },
  terminal: { accent: '#2ee6a8', glow: 'rgba(46,230,168,0.12)', icon: LayoutDashboard, side: 'left' },
};

/* ── candles: ascending candlesticks + trend line ── */
function CandlesMotif({ c }: { c: string }) {
  const candles = [
    { x: 180, o: 420, cl: 385, h: 370, w: 30, bull: true },
    { x: 280, o: 395, cl: 405, h: 372, w: 30, bull: false },
    { x: 380, o: 395, cl: 340, h: 315, w: 30, bull: true },
    { x: 480, o: 350, cl: 365, h: 330, w: 30, bull: false },
    { x: 580, o: 355, cl: 290, h: 265, w: 30, bull: true },
    { x: 680, o: 300, cl: 310, h: 280, w: 30, bull: false },
    { x: 780, o: 300, cl: 230, h: 205, w: 30, bull: true },
    { x: 880, o: 240, cl: 200, h: 180, w: 30, bull: true },
  ];
  return (
    <g fill="none" stroke={c} strokeWidth={2}>
      <polyline
        points="180,385 280,400 380,340 480,360 580,290 680,305 780,230 880,200"
        strokeWidth={3}
        strokeOpacity={0.5}
      />
      {candles.map((k) => (
        <g key={k.x} strokeOpacity={k.bull ? 0.65 : 0.4}>
          <line x1={k.x} y1={k.h} x2={k.x} y2={k.o + (k.cl - k.o) * 2} />
          <rect
            x={k.x - k.w / 2}
            y={Math.min(k.o, k.cl)}
            width={k.w}
            height={Math.max(4, Math.abs(k.cl - k.o))}
            rx={4}
            fill={k.bull ? c : '#ff4d5e'}
            fillOpacity={k.bull ? 0.5 : 0.28}
            stroke="none"
          />
        </g>
      ))}
    </g>
  );
}

/* ── signals: zig-zag trend + BUY / SELL markers ── */
function SignalsMotif({ c }: { c: string }) {
  return (
    <g>
      <polyline
        points="140,470 260,400 380,430 500,300 620,340 740,210 860,260 980,140"
        fill="none"
        stroke={c}
        strokeWidth={3}
        strokeOpacity={0.5}
      />
      {/* SELL badge */}
      <g transform="translate(380,430)">
        <circle r={30} fill="#ff4d5e" fillOpacity={0.16} />
        <circle r={30} fill="none" stroke="#ff4d5e" strokeOpacity={0.5} strokeWidth={1.5} />
        <path d="M 0 -14 L 0 14 M 0 14 L -9 5 M 0 14 L 9 5" stroke="#ff4d5e" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* BUY badge */}
      <g transform="translate(740,210)">
        <circle r={30} fill={c} fillOpacity={0.16} />
        <circle r={30} fill="none" stroke={c} strokeOpacity={0.55} strokeWidth={1.5} />
        <path d="M 0 14 L 0 -14 M 0 -14 L -9 -5 M 0 -14 L 9 -5" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* price tags */}
      <g fill={c} fillOpacity={0.75} fontSize={22} fontFamily="monospace">
        <text x={250} y={380}>1.842</text>
        <text x={640} y={330}>0.7124</text>
      </g>
    </g>
  );
}

/* ── gold: rising golden curve + crown + sparkles ── */
function GoldMotif({ c }: { c: string }) {
  return (
    <g>
      <path
        d="M 120 480 Q 260 420 380 380 T 640 250 Q 780 180 900 130"
        fill="none"
        stroke={c}
        strokeWidth={4}
        strokeOpacity={0.55}
        strokeLinecap="round"
      />
      {/* area glow under curve */}
      <path
        d="M 120 480 Q 260 420 380 380 T 640 250 Q 780 180 900 130 L 900 480 Z"
        fill={c}
        fillOpacity={0.05}
      />
      {/* crown */}
      <g transform="translate(905,110)" fill={c} fillOpacity={0.7} stroke={c} strokeWidth={1.5}>
        <path d="M -52 22 L -70 -26 L -32 -6 L 0 -34 L 32 -6 L 70 -26 L 52 22 Z" />
        <rect x={-40} y={22} width={80} height={12} rx={3} />
      </g>
      {/* sparkles */}
      <g stroke={c} strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round">
        <path d="M 560 120 v 26 M 547 133 h 26" />
        <path d="M 740 300 v 22 M 729 311 h 22" />
        <path d="M 300 240 v 20 M 290 250 h 20" />
      </g>
      {/* coins */}
      <g fill="none" stroke={c} strokeOpacity={0.4} strokeWidth={2}>
        <circle cx={240} cy={200} r={34} />
        <circle cx={240} cy={200} r={24} />
        <circle cx={240} cy={200} r={12} />
        <circle cx={680} cy={420} r={26} />
        <circle cx={680} cy={420} r={16} />
      </g>
    </g>
  );
}

/* ── heatmap: order-book style price tiles ── */
function HeatmapMotif({ c }: { c: string }) {
  const rows = [
    [0.28, 0.5, 0.34, -0.3, -0.55, -0.2, 0.42, 0.6],
    [0.5, 0.36, -0.25, -0.6, -0.4, 0.3, 0.55, 0.38],
    [0.34, -0.3, -0.55, -0.2, 0.42, 0.6, 0.3, -0.25],
    [-0.3, -0.55, -0.2, 0.42, 0.6, 0.3, -0.25, -0.6],
    [0.42, 0.6, 0.3, -0.25, -0.6, -0.4, 0.3, 0.55],
  ];
  return (
    <g>
      {rows.map((row, r) => (
        <g key={r}>
          {row.map((v, i) => {
            const x = 240 + i * 92;
            const y = 130 + r * 74;
            const pos = v >= 0;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={76}
                height={58}
                rx={12}
                fill={pos ? c : '#ff4d5e'}
                fillOpacity={0.06 + Math.abs(v) * 0.22}
                stroke={pos ? c : '#ff4d5e'}
                strokeOpacity={0.25}
              />
            );
          })}
        </g>
      ))}
      <g fill={c} fillOpacity={0.6} fontSize={20} fontFamily="monospace">
        <text x={318} y={168}>+0.84%</text>
        <text x={770} y={390}>−1.26%</text>
      </g>
    </g>
  );
}

/* ── paper: article page + mini chart ── */
function PaperMotif({ c }: { c: string }) {
  return (
    <g>
      {/* document */}
      <rect x={160} y={120} width={360} height={440} rx={22} fill={c} fillOpacity={0.05} stroke={c} strokeOpacity={0.35} strokeWidth={2} />
      <path d="M 420 120 L 520 220 L 420 220 Z" fill={c} fillOpacity={0.14} stroke={c} strokeOpacity={0.3} strokeWidth={2} />
      <g stroke={c} strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round">
        <line x1={205} y1={185} x2={380} y2={185} />
        <line x1={205} y1={225} x2={460} y2={225} />
        <line x1={205} y1={265} x2={440} y2={265} />
        <line x1={205} y1={305} x2={470} y2={305} />
        <line x1={205} y1={345} x2={330} y2={345} />
      </g>
      {/* mini chart */}
      <g transform="translate(560,160)">
        <polyline points="0,330 90,280 180,300 270,200 360,150 450,120" fill="none" stroke={c} strokeWidth={4} strokeOpacity={0.6} strokeLinecap="round" />
        <circle cx={450} cy={120} r={8} fill={c} fillOpacity={0.7} />
        <g stroke={c} strokeOpacity={0.25} strokeWidth={1.5}>
          <line x1={0} y1={330} x2={450} y2={330} />
          <line x1={0} y1={120} x2={450} y2={120} strokeDasharray="4 8" />
        </g>
      </g>
    </g>
  );
}

/* ── faq: giant question mark + answer bars ── */
function FaqMotif({ c }: { c: string }) {
  return (
    <g>
      <text
        x={420}
        y={470}
        fontSize={430}
        fontWeight={700}
        fill={c}
        fillOpacity={0.1}
        style={{ fontFamily: 'var(--font-display), sans-serif' }}
      >
        ?
      </text>
      <g fill={c} fillOpacity={0.4}>
        <rect x={700} y={230} width={220} height={26} rx={13} />
        <rect x={700} y={290} width={160} height={26} rx={13} fillOpacity={0.28} />
        <rect x={700} y={350} width={200} height={26} rx={13} fillOpacity={0.2} />
      </g>
      <g stroke={c} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round">
        <line x1={700} y1={450} x2={930} y2={450} />
        <line x1={700} y1={500} x2={860} y2={500} />
      </g>
    </g>
  );
}

/* ── profile: avatar rings + inside chart ── */
function ProfileMotif({ c }: { c: string }) {
  return (
    <g>
      <circle cx={400} cy={300} r={190} fill="none" stroke={c} strokeOpacity={0.22} strokeWidth={3} />
      <circle cx={400} cy={300} r={150} fill={c} fillOpacity={0.05} />
      <circle cx={400} cy={300} r={150} fill="none" stroke={c} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="10 14" />
      {/* head + shoulders inside */}
      <circle cx={400} cy={258} r={52} fill={c} fillOpacity={0.5} />
      <path d="M 322 400 Q 400 330 478 400 Z" fill={c} fillOpacity={0.35} />
      {/* mini chart beside */}
      <g transform="translate(660,140)">
        <polyline points="0,280 80,240 160,260 240,170 320,190 400,110" fill="none" stroke={c} strokeWidth={4} strokeOpacity={0.55} strokeLinecap="round" />
        <g stroke={c} strokeOpacity={0.2} strokeWidth={1.5}>
          <line x1={0} y1={280} x2={400} y2={280} />
          <line x1={0} y1={110} x2={400} y2={110} strokeDasharray="4 8" />
        </g>
        <rect x={0} y={280} width={400} height={70} fill={c} fillOpacity={0.05} />
      </g>
    </g>
  );
}

/* ── chat: telegram bubbles + paper plane ── */
function ChatMotif({ c }: { c: string }) {
  return (
    <g>
      {/* incoming bubble */}
      <g transform="translate(560,170)">
        <rect x={0} y={0} width={340} height={120} rx={24} fill={c} fillOpacity={0.08} stroke={c} strokeOpacity={0.35} strokeWidth={2} />
        <path d="M 60 120 L 40 170 L 110 122 Z" fill={c} fillOpacity={0.08} stroke={c} strokeOpacity={0.35} strokeWidth={2} strokeLinejoin="round" />
        <g fill={c} fillOpacity={0.5}>
          <circle cx={60} cy={40} r={9} />
          <circle cx={110} cy={40} r={9} />
          <circle cx={160} cy={40} r={9} />
        </g>
        <g stroke={c} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round">
          <line x1={60} y1={70} x2={260} y2={70} />
          <line x1={60} y1={95} x2={210} y2={95} />
        </g>
      </g>
      {/* outgoing bubble */}
      <g transform="translate(760,330)">
        <rect x={0} y={0} width={260} height={100} rx={24} fill={c} fillOpacity={0.14} stroke={c} strokeOpacity={0.45} strokeWidth={2} />
        <path d="M 220 100 L 250 150 L 180 102 Z" fill={c} fillOpacity={0.14} stroke={c} strokeOpacity={0.45} strokeWidth={2} strokeLinejoin="round" />
        <g stroke={c} strokeOpacity={0.5} strokeWidth={6} strokeLinecap="round">
          <line x1={60} y1={38} x2={190} y2={38} />
          <line x1={60} y1={64} x2={140} y2={64} />
        </g>
      </g>
      {/* paper plane */}
      <g transform="translate(300,240) scale(3.4)" fill={c} fillOpacity={0.7}>
        <path d="M 0 22 L 30 0 L 22 30 L 12 22 Z" />
        <path d="M 12 22 L 30 0" stroke={c} strokeOpacity={0.9} strokeWidth={2.4} fill="none" />
      </g>
    </g>
  );
}

/* ── lock: padlock + chart ── */
function LockMotif({ c }: { c: string }) {
  return (
    <g>
      <g transform="translate(330,230)">
        {/* shackle */}
        <path
          d="M -70 30 a 70 70 0 0 1 140 0"
          fill="none"
          stroke={c}
          strokeOpacity={0.6}
          strokeWidth={20}
          strokeLinecap="round"
        />
        {/* body */}
        <rect x={-100} y={30} width={200} height={150} rx={26} fill={c} fillOpacity={0.1} stroke={c} strokeOpacity={0.55} strokeWidth={4} />
        <circle cx={0} cy={90} r={17} fill="none" stroke={c} strokeOpacity={0.7} strokeWidth={6} />
        <rect x={-8} y={104} width={16} height={34} rx={6} fill={c} fillOpacity={0.7} />
      </g>
      {/* chart */}
      <g transform="translate(620,140)">
        <polyline points="0,300 90,260 180,280 270,190 360,210 450,120" fill="none" stroke={c} strokeWidth={4} strokeOpacity={0.55} strokeLinecap="round" />
        <circle cx={450} cy={120} r={9} fill={c} fillOpacity={0.7} />
        <g stroke={c} strokeOpacity={0.2} strokeWidth={1.5}>
          <line x1={0} y1={300} x2={450} y2={300} />
          <line x1={0} y1={120} x2={450} y2={120} strokeDasharray="4 8" />
        </g>
      </g>
    </g>
  );
}

/* ── terminal: prompt + signal bars ── */
function TerminalMotif({ c }: { c: string }) {
  return (
    <g fontFamily="monospace">
      <text x={180} y={260} fontSize={64} fontWeight={700} fill={c} fillOpacity={0.75}>
        &gt;_
      </text>
      <text x={180} y={330} fontSize={34} fill={c} fillOpacity={0.5}>
        signal: BUY BTC/USDT
      </text>
      <text x={180} y={390} fontSize={34} fill={c} fillOpacity={0.35}>
        winrate: 94.2%
      </text>
      <rect x={180} y={300} width={16} height={44} fill={c} fillOpacity={0.7} />
      {/* bars */}
      <g transform="translate(560,140)">
        {[0.85, 0.6, 0.95, 0.5, 0.75, 0.9, 0.55].map((v, i) => (
          <rect
            key={i}
            x={i * 70}
            y={320 - 260 * v}
            width={48}
            height={260 * v}
            rx={10}
            fill={i % 2 === 0 ? c : '#ff4d5e'}
            fillOpacity={i % 2 === 0 ? 0.45 : 0.25}
          />
        ))}
      </g>
    </g>
  );
}

const MOTIFS: Record<HeroVariant, (c: string) => ReactNode> = {
  candles: (c) => <CandlesMotif c={c} />,
  signals: (c) => <SignalsMotif c={c} />,
  gold: (c) => <GoldMotif c={c} />,
  heatmap: (c) => <HeatmapMotif c={c} />,
  paper: (c) => <PaperMotif c={c} />,
  faq: (c) => <FaqMotif c={c} />,
  profile: (c) => <ProfileMotif c={c} />,
  chat: (c) => <ChatMotif c={c} />,
  lock: (c) => <LockMotif c={c} />,
  terminal: (c) => <TerminalMotif c={c} />,
};

interface TradingHeroDecorProps {
  variant: HeroVariant;
  className?: string;
}

export function TradingHeroDecor({ variant, className }: TradingHeroDecorProps) {
  const { accent, glow, icon: Icon, side } = VARIANTS[variant];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
    >
      {/* accent orbs */}
      <div
        className="glow-orb -top-20 right-[8%] h-[380px] w-[560px]"
        style={{ backgroundColor: glow, opacity: 0.9 }}
      />
      <div
        className="glow-orb -bottom-24 left-[4%] h-[320px] w-[320px]"
        style={{ backgroundColor: glow, opacity: 0.7 }}
      />

      {/* watermark icon */}
      <Icon
        className={`absolute bottom-8 h-[340px] w-[340px] sm:h-[420px] sm:w-[420px] ${
          side === 'right' ? 'right-[6%]' : 'left-[6%]'
        }`}
        style={{ color: accent, opacity: 0.07 }}
        strokeWidth={1}
      />

      {/* chart motif */}
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {MOTIFS[variant](accent)}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   TradingCover — trading-styled cover placeholder for blog posts
   (used when a post has no coverImage).
   ──────────────────────────────────────────────────────────── */

const COVER_COLORS: Record<string, string> = {
  Trading: '#2ee6a8',
  Bitcoin: '#f7931a',
  Signal: '#3ec9f5',
  Market: '#7c8cf8',
  DeFi: '#9b59b6',
  NFT: '#ff7ab8',
  Solana: '#00ffa3',
  Ethereum: '#627eea',
};

export function TradingCover({ category, className }: { category: string; className?: string }) {
  const c = COVER_COLORS[category] ?? '#cdd3e1';
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${category} muqova rasmi`}
    >
      <defs>
        <linearGradient id="tc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b0f19" />
          <stop offset="100%" stopColor="#05070e" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#tc-bg)" />
      {/* grid */}
      <g stroke={c} strokeOpacity={0.06} strokeWidth={1}>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={240} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`h${i}`} x1={0} y1={i * 60} x2={400} y2={i * 60} />
        ))}
      </g>
      {/* candles */}
      <g>
        {[
          { x: 60, o: 170, cl: 140, h: 120, bull: true },
          { x: 110, o: 145, cl: 155, h: 130, bull: false },
          { x: 160, o: 150, cl: 110, h: 90, bull: true },
          { x: 210, o: 115, cl: 125, h: 100, bull: false },
          { x: 260, o: 118, cl: 80, h: 60, bull: true },
          { x: 310, o: 85, cl: 95, h: 70, bull: false },
          { x: 360, o: 88, cl: 55, h: 38, bull: true },
        ].map((k, i) => (
          <g key={i} stroke={k.bull ? c : '#ff4d5e'} strokeOpacity={k.bull ? 0.6 : 0.4} strokeWidth={2}>
            <line x1={k.x} y1={k.h} x2={k.x} y2={Math.min(k.o, k.cl) - 22} />
            <rect
              x={k.x - 16}
              y={Math.min(k.o, k.cl)}
              width={32}
              height={Math.max(4, Math.abs(k.cl - k.o))}
              rx={6}
              fill={k.bull ? c : '#ff4d5e'}
              fillOpacity={k.bull ? 0.55 : 0.3}
              stroke="none"
            />
          </g>
        ))}
        {/* trend line */}
        <polyline
          points="60,150 110,140 160,110 210,120 260,80 310,90 360,55"
          fill="none"
          stroke={c}
          strokeWidth={3}
          strokeOpacity={0.8}
          strokeLinecap="round"
        />
      </g>
      {/* category tag */}
      <g transform="translate(24, 24)">
        <rect width={category.length * 14 + 28} height={34} rx={17} fill={c} fillOpacity={0.14} stroke={c} strokeOpacity={0.5} strokeWidth={1.5} />
        <text x={14} y={23} fontSize={16} fontWeight={600} fill={c} style={{ fontFamily: 'var(--font-display), sans-serif' }}>
          {category}
        </text>
      </g>
    </svg>
  );
}
