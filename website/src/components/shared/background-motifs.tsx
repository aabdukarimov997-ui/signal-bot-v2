'use client';

import type { ReactElement, ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────
   Orqa fon motivlari — har bir fon o'ziga xos dekorda chiziladi.
   Har bir motiv aksent rangdagi (rgba) `c` bilan ishlaydi.
   viewBox: 1200 x 800.
   ──────────────────────────────────────────────────────────── */

export type MotifId =
  | 'candles'
  | 'bars'
  | 'heatmap'
  | 'waves'
  | 'diamonds'
  | 'coins'
  | 'zigzag'
  | 'chart-area'
  | 'arrow-up'
  | 'rings'
  | 'stars'
  | 'signal'
  | 'orbit';

/* shamdonlar grafigi */
function Candles({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c} strokeWidth={2}>
      <polyline
        points="120,560 240,500 360,520 480,420 600,380 720,300 840,250 960,180 1080,140"
        strokeWidth={3}
        strokeOpacity={0.5}
      />
      {[
        { x: 160, o: 540, cl: 490, h: 460, bull: true },
        { x: 320, o: 510, cl: 520, h: 480, bull: false },
        { x: 480, o: 500, cl: 430, h: 400, bull: true },
        { x: 640, o: 440, cl: 450, h: 410, bull: false },
        { x: 800, o: 445, cl: 360, h: 330, bull: true },
        { x: 960, o: 370, cl: 380, h: 340, bull: false },
        { x: 1080, o: 370, cl: 300, h: 270, bull: true },
      ].map((k, i) => (
        <g key={i} strokeOpacity={k.bull ? 0.6 : 0.35}>
          <line x1={k.x} y1={k.h} x2={k.x} y2={Math.max(k.o, k.cl) + 40} />
          <rect
            x={k.x - 22}
            y={Math.min(k.o, k.cl)}
            width={44}
            height={Math.max(6, Math.abs(k.cl - k.o))}
            rx={6}
            fill={k.bull ? c : undefined}
            fillOpacity={k.bull ? 0.4 : 0.2}
            stroke="none"
          />
        </g>
      ))}
    </g>
  );
}

/* hajm (volume) barlari */
function Bars({ c }: { c: string }) {
  const heights = [70, 120, 90, 160, 130, 200, 150, 240, 180, 260, 220, 300];
  return (
    <g>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={90 + i * 90}
          y={620 - h}
          width={52}
          height={h}
          rx={10}
          fill={c}
          fillOpacity={i % 3 === 0 ? 0.22 : 0.1}
        />
      ))}
      <polyline
        points="90,560 180,540 270,520 360,480 450,460 540,430 630,400 720,380 810,340 900,320 990,280 1080,260"
        fill="none"
        stroke={c}
        strokeWidth={3}
        strokeOpacity={0.45}
      />
    </g>
  );
}

/* order-book heatmap */
function Heatmap({ c }: { c: string }) {
  const rows = [
    [0.3, 0.55, -0.25, -0.6, 0.35, 0.5],
    [0.55, -0.3, -0.6, -0.4, 0.45, 0.6],
    [-0.25, -0.6, -0.4, 0.3, 0.6, 0.35],
    [-0.6, -0.4, 0.3, 0.55, 0.25, -0.3],
    [0.35, 0.5, 0.6, 0.3, -0.25, -0.6],
  ];
  return (
    <g>
      {rows.map((row, r) =>
        row.map((v, i) => {
          const pos = v >= 0;
          return (
            <rect
              key={`${r}-${i}`}
              x={180 + i * 140}
              y={180 + r * 110}
              width={120}
              height={90}
              rx={14}
              fill={pos ? c : undefined}
              fillOpacity={0.05 + Math.abs(v) * 0.2}
              stroke={pos ? c : undefined}
              strokeOpacity={0.3}
            />
          );
        })
      )}
    </g>
  );
}

/* to'lqinlar */
function Waves({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c} strokeLinecap="round">
      <path
        d="M 0 320 Q 100 200 200 320 T 400 320 T 600 320 T 800 320 T 1000 320 T 1200 320"
        strokeWidth={3}
        strokeOpacity={0.4}
      />
      <path
        d="M 0 460 Q 100 340 200 460 T 400 460 T 600 460 T 800 460 T 1000 460 T 1200 460"
        strokeWidth={2.5}
        strokeOpacity={0.28}
      />
      <path
        d="M 0 600 Q 100 480 200 600 T 400 600 T 600 600 T 800 600 T 1000 600 T 1200 600"
        strokeWidth={2}
        strokeOpacity={0.18}
      />
    </g>
  );
}

/* olmoslar */
function Diamonds({ c }: { c: string }) {
  const d = 110;
  const items: ReactElement[] = [];
  for (let r = 0; r < 6; r++) {
    for (let col = 0; col < 9; col++) {
      const x = 80 + col * d + (r % 2 ? d / 2 : 0);
      const y = 90 + r * d;
      items.push(
        <g key={`${r}-${col}`} opacity={0.5 - r * 0.05}>
          <rect
            x={x - 24}
            y={y - 24}
            width={48}
            height={48}
            rx={6}
            transform={`rotate(45 ${x} ${y})`}
            fill="none"
            stroke={c}
            strokeOpacity={0.35}
            strokeWidth={2}
          />
          <circle cx={x} cy={y} r={4} fill={c} fillOpacity={0.5} />
        </g>
      );
    }
  }
  return <g>{items}</g>;
}

/* tangalar */
function Coins({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c}>
      {[
        { x: 200, y: 300, r: 90 },
        { x: 440, y: 520, r: 70 },
        { x: 700, y: 260, r: 80 },
        { x: 950, y: 480, r: 95 },
      ].map((coin, i) => (
        <g key={i}>
          <circle cx={coin.x} cy={coin.y} r={coin.r} strokeOpacity={0.4} strokeWidth={3} />
          <circle cx={coin.x} cy={coin.y} r={coin.r * 0.68} strokeOpacity={0.25} strokeWidth={2} />
          <circle cx={coin.x} cy={coin.y} r={coin.r * 0.34} fill={c} fillOpacity={0.12} stroke="none" />
        </g>
      ))}
    </g>
  );
}

/* zig-zag trend + markerlar */
function Zigzag({ c }: { c: string }) {
  return (
    <g>
      <polyline
        points="100,520 220,440 340,470 460,360 580,390 700,280 820,310 940,200 1060,230 1140,160"
        fill="none"
        stroke={c}
        strokeWidth={3.5}
        strokeOpacity={0.5}
      />
      <g transform="translate(940,200)">
        <path d="M 0 22 L 0 -22 M 0 -22 L -12 -10 M 0 -22 L 12 -10" stroke={c} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity={0.6} />
      </g>
      <g transform="translate(460,360)">
        <path d="M 0 -22 L 0 22 M 0 22 L -12 10 M 0 22 L 12 10" stroke={c} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity={0.4} />
      </g>
    </g>
  );
}

/* chiziqli grafik + maydon */
function ChartArea({ c }: { c: string }) {
  return (
    <g>
      <path
        d="M 80 620 L 260 540 L 420 570 L 580 430 L 720 470 L 880 320 L 1040 360 L 1140 240 L 1140 800 L 80 800 Z"
        fill={c}
        fillOpacity={0.05}
        stroke="none"
      />
      <polyline
        points="80,620 260,540 420,570 580,430 720,470 880,320 1040,360 1140,240"
        fill="none"
        stroke={c}
        strokeWidth={3.5}
        strokeOpacity={0.55}
        strokeLinecap="round"
      />
      <g stroke={c} strokeOpacity={0.2} strokeWidth={1.5}>
        <line x1={80} y1={540} x2={1140} y2={540} strokeDasharray="6 10" />
        <line x1={80} y1={320} x2={1140} y2={320} strokeDasharray="6 10" />
      </g>
    </g>
  );
}

/* yuqoriga strelkalar */
function ArrowUp({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round">
      {[
        { x: 260, y: 420, s: 1.4 },
        { x: 620, y: 280, s: 1.8 },
        { x: 980, y: 460, s: 1.2 },
      ].map((a, i) => (
        <g key={i} opacity={0.45} transform={`translate(${a.x} ${a.y}) scale(${a.s})`}>
          <path d="M 0 90 L 0 -90 M 0 -90 L -34 -52 M 0 -90 L 34 -52" strokeWidth={10} />
          <path d="M 0 130 L 0 10 M 0 10 L -30 46 M 0 10 L 30 46" strokeWidth={7} opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

/* halqalar */
function Rings({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c}>
      <circle cx={300} cy={350} r={160} strokeOpacity={0.4} strokeWidth={2} />
      <circle cx={300} cy={350} r={260} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="12 16" />
      <circle cx={300} cy={350} r={360} strokeOpacity={0.14} strokeWidth={2} />
      <circle cx={920} cy={420} r={120} strokeOpacity={0.4} strokeWidth={2} />
      <circle cx={920} cy={420} r={210} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="12 16" />
      <circle cx={920} cy={420} r={300} strokeOpacity={0.14} strokeWidth={2} />
    </g>
  );
}

/* yulduzchalar */
function Stars({ c }: { c: string }) {
  return (
    <g stroke={c} strokeWidth={3} strokeLinecap="round" fill="none">
      {[
        { x: 200, y: 200, s: 26 },
        { x: 460, y: 340, s: 18 },
        { x: 720, y: 180, s: 30 },
        { x: 980, y: 320, s: 22 },
        { x: 340, y: 560, s: 20 },
        { x: 860, y: 560, s: 28 },
        { x: 1080, y: 640, s: 16 },
      ].map((st, i) => (
        <g key={i} opacity={0.5 - i * 0.04} transform={`translate(${st.x} ${st.y})`}>
          <path d={`M 0 ${-st.s} v ${st.s * 2} M ${-st.s} 0 h ${st.s * 2}`} />
          <path d={`M ${-st.s * 0.5} ${-st.s * 0.5} l ${st.s} ${st.s} M ${-st.s * 0.5} ${st.s * 0.5} l ${st.s} ${-st.s}`} opacity={0.5} strokeWidth={2} />
        </g>
      ))}
    </g>
  );
}

/* BUY/SELL signal markerlari */
function Signal({ c }: { c: string }) {
  return (
    <g>
      <polyline
        points="140,560 280,480 420,510 560,380 700,410 840,300 980,330 1120,220"
        fill="none"
        stroke={c}
        strokeWidth={3}
        strokeOpacity={0.45}
      />
      <g transform="translate(560,380)">
        <circle r={46} fill={c} fillOpacity={0.1} />
        <circle r={46} fill="none" stroke={c} strokeOpacity={0.5} strokeWidth={2} />
        <path d="M 0 -26 L 0 26 M 0 26 L -16 10 M 0 26 L 16 10" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity={0.65} />
      </g>
      <g transform="translate(840,300)">
        <circle r={46} fill={c} fillOpacity={0.12} />
        <circle r={46} fill="none" stroke={c} strokeOpacity={0.6} strokeWidth={2} />
        <path d="M 0 26 L 0 -26 M 0 -26 L -16 -10 M 0 -26 L 16 -10" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity={0.75} />
      </g>
    </g>
  );
}

/* orbit (ellipslar) */
function Orbit({ c }: { c: string }) {
  return (
    <g fill="none" stroke={c}>
      <ellipse cx={600} cy={400} rx={420} ry={130} strokeOpacity={0.35} strokeWidth={2.5} />
      <ellipse cx={600} cy={400} rx={300} ry={230} strokeOpacity={0.25} strokeWidth={2} transform="rotate(24 600 400)" />
      <ellipse cx={600} cy={400} rx={480} ry={250} strokeOpacity={0.15} strokeWidth={2} transform="rotate(-18 600 400)" />
      <circle cx={600} cy={400} r={60} fill={c} fillOpacity={0.08} stroke="none" />
      <circle cx={1020} cy={330} r={14} fill={c} fillOpacity={0.5} />
      <circle cx={180} cy={540} r={10} fill={c} fillOpacity={0.4} />
    </g>
  );
}

export const MOTIFS: Record<MotifId, (c: string) => ReactNode> = {
  candles: (c) => <Candles c={c} />,
  bars: (c) => <Bars c={c} />,
  heatmap: (c) => <Heatmap c={c} />,
  waves: (c) => <Waves c={c} />,
  diamonds: (c) => <Diamonds c={c} />,
  coins: (c) => <Coins c={c} />,
  zigzag: (c) => <Zigzag c={c} />,
  'chart-area': (c) => <ChartArea c={c} />,
  'arrow-up': (c) => <ArrowUp c={c} />,
  rings: (c) => <Rings c={c} />,
  stars: (c) => <Stars c={c} />,
  signal: (c) => <Signal c={c} />,
  orbit: (c) => <Orbit c={c} />,
};
