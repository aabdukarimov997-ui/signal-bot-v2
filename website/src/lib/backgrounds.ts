/* ────────────────────────────────────────────────────────────
   Sayt fonlari — 20 ta almashinadigan fon.
   Har bir fon: tungi/kunduzgi palitra, pattern, aksent rang,
   o'ziga xos shrift (DISPLAY_FONTS) va orqa fon motivi (MOTIFS).
   ──────────────────────────────────────────────────────────── */

export type BgPattern = 'grid' | 'dots' | 'diagonal' | 'rings' | 'none';

export interface FontDef {
  id: string;
  label: string;
  /** CSS o'zgaruvchisi (layout.tsx'da next/font orqali yuklanadi) */
  var: string;
}

export const DISPLAY_FONTS: Record<string, FontDef> = {
  'space-grotesk': { id: 'space-grotesk', label: 'Space Grotesk', var: 'var(--font-display)' },
  sora: { id: 'sora', label: 'Sora', var: 'var(--font-display-sora)' },
  unbounded: { id: 'unbounded', label: 'Unbounded', var: 'var(--font-display-unbounded)' },
  outfit: { id: 'outfit', label: 'Outfit', var: 'var(--font-display-outfit)' },
  syne: { id: 'syne', label: 'Syne', var: 'var(--font-display-syne)' },
  playfair: { id: 'playfair', label: 'Playfair Display', var: 'var(--font-display-playfair)' },
  bebas: { id: 'bebas', label: 'Bebas Neue', var: 'var(--font-display-bebas)' },
  fraunces: { id: 'fraunces', label: 'Fraunces', var: 'var(--font-display-fraunces)' },
  oswald: { id: 'oswald', label: 'Oswald', var: 'var(--font-display-oswald)' },
  cormorant: { id: 'cormorant', label: 'Cormorant', var: 'var(--font-display-cormorant)' },
};

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

export interface BackgroundDef {
  id: string;
  label: string;
  /** tungi rejim uchun 3 rang */
  dark: { c1: string; c2: string; c3: string };
  /** kunduzgi rejim uchun 3 rang */
  light: { c1: string; c2: string; c3: string };
  pattern: BgPattern;
  /** orb, pattern va motiv uchun aksent rang */
  accent: string;
  /** ushbu fon uchun display shrift */
  font: string;
  /** ushbu fon uchun orqa fon motivi (rasim) */
  motif: MotifId;
}

export const BACKGROUNDS: BackgroundDef[] = [
  {
    id: 'classic',
    label: 'Klassik',
    dark: { c1: '#2ee6a8', c2: '#f5b93e', c3: '#3ec9f5' },
    light: { c1: '#12b886', c2: '#b8860b', c3: '#0ea5e9' },
    pattern: 'grid',
    accent: '#2ee6a8',
    font: 'space-grotesk',
    motif: 'candles',
  },
  {
    id: 'emerald-boom',
    label: 'Emerald Boom',
    dark: { c1: '#2ee6a8', c2: '#12b886', c3: '#7df5cd' },
    light: { c1: '#0f9d6e', c2: '#0b6e4f', c3: '#34d399' },
    pattern: 'dots',
    accent: '#2ee6a8',
    font: 'sora',
    motif: 'bars',
  },
  {
    id: 'crimson-rally',
    label: 'Crimson Rally',
    dark: { c1: '#ff4d5e', c2: '#ff7ab8', c3: '#ff8a3d' },
    light: { c1: '#d62839', c2: '#b5179e', c3: '#e85d04' },
    pattern: 'diagonal',
    accent: '#ff4d5e',
    font: 'unbounded',
    motif: 'heatmap',
  },
  {
    id: 'ocean-depth',
    label: 'Ocean Depth',
    dark: { c1: '#3ec9f5', c2: '#1e5aff', c3: '#2dd4bf' },
    light: { c1: '#0284c7', c2: '#1d4ed8', c3: '#0d9488' },
    pattern: 'rings',
    accent: '#3ec9f5',
    font: 'outfit',
    motif: 'waves',
  },
  {
    id: 'purple-hype',
    label: 'Purple Hype',
    dark: { c1: '#a78bfa', c2: '#7c8cf8', c3: '#e879f9' },
    light: { c1: '#7c3aed', c2: '#4f46e5', c3: '#c026d3' },
    pattern: 'dots',
    accent: '#a78bfa',
    font: 'syne',
    motif: 'diamonds',
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    dark: { c1: '#f5b93e', c2: '#ffd166', c3: '#ff9f1c' },
    light: { c1: '#b8860b', c2: '#d97706', c3: '#b45309' },
    pattern: 'diagonal',
    accent: '#f5b93e',
    font: 'playfair',
    motif: 'coins',
  },
  {
    id: 'neon-city',
    label: 'Neon City',
    dark: { c1: '#22d3ee', c2: '#e879f9', c3: '#34d399' },
    light: { c1: '#0891b2', c2: '#c026d3', c3: '#059669' },
    pattern: 'grid',
    accent: '#22d3ee',
    font: 'bebas',
    motif: 'zigzag',
  },
  {
    id: 'midnight-bull',
    label: 'Midnight Bull',
    dark: { c1: '#2ee6a8', c2: '#38bdf8', c3: '#818cf8' },
    light: { c1: '#0f9d6e', c2: '#0284c7', c3: '#4f46e5' },
    pattern: 'grid',
    accent: '#38bdf8',
    font: 'fraunces',
    motif: 'chart-area',
  },
  {
    id: 'lava-flow',
    label: 'Lava Flow',
    dark: { c1: '#ff5e3a', c2: '#ff9f1c', c3: '#ff2d55' },
    light: { c1: '#dc2626', c2: '#ea580c', c3: '#be123c' },
    pattern: 'diagonal',
    accent: '#ff5e3a',
    font: 'oswald',
    motif: 'arrow-up',
  },
  {
    id: 'arctic-chill',
    label: 'Arctic Chill',
    dark: { c1: '#e0f2fe', c2: '#bae6fd', c3: '#a5f3fc' },
    light: { c1: '#0ea5e9', c2: '#0369a1', c3: '#0891b2' },
    pattern: 'rings',
    accent: '#7dd3fc',
    font: 'cormorant',
    motif: 'rings',
  },
  {
    id: 'solar-flare',
    label: 'Solar Flare',
    dark: { c1: '#fde047', c2: '#f59e0b', c3: '#f97316' },
    light: { c1: '#ca8a04', c2: '#b45309', c3: '#ea580c' },
    pattern: 'dots',
    accent: '#fde047',
    font: 'space-grotesk',
    motif: 'stars',
  },
  {
    id: 'matrix-rain',
    label: 'Matrix Rain',
    dark: { c1: '#4ade80', c2: '#22c55e', c3: '#86efac' },
    light: { c1: '#15803d', c2: '#16a34a', c3: '#4ade80' },
    pattern: 'grid',
    accent: '#4ade80',
    font: 'sora',
    motif: 'signal',
  },
  {
    id: 'pink-pump',
    label: 'Pink Pump',
    dark: { c1: '#f472b6', c2: '#fb7185', c3: '#e879f9' },
    light: { c1: '#db2777', c2: '#e11d48', c3: '#c026d3' },
    pattern: 'dots',
    accent: '#f472b6',
    font: 'syne',
    motif: 'orbit',
  },
  {
    id: 'royal-wealth',
    label: 'Royal Wealth',
    dark: { c1: '#f5b93e', c2: '#f59e0b', c3: '#fde68a' },
    light: { c1: '#92600a', c2: '#b45309', c3: '#a16207' },
    pattern: 'rings',
    accent: '#f5b93e',
    font: 'playfair',
    motif: 'coins',
  },
  {
    id: 'teal-wave',
    label: 'Teal Wave',
    dark: { c1: '#2dd4bf', c2: '#14b8a6', c3: '#5eead4' },
    light: { c1: '#0d9488', c2: '#0f766e', c3: '#14b8a6' },
    pattern: 'diagonal',
    accent: '#2dd4bf',
    font: 'outfit',
    motif: 'waves',
  },
  {
    id: 'violet-signal',
    label: 'Violet Signal',
    dark: { c1: '#818cf8', c2: '#6366f1', c3: '#a5b4fc' },
    light: { c1: '#4f46e5', c2: '#4338ca', c3: '#6366f1' },
    pattern: 'grid',
    accent: '#818cf8',
    font: 'fraunces',
    motif: 'chart-area',
  },
  {
    id: 'copper-trend',
    label: 'Copper Trend',
    dark: { c1: '#fb923c', c2: '#f97316', c3: '#fdba74' },
    light: { c1: '#c2410c', c2: '#ea580c', c3: '#d97706' },
    pattern: 'diagonal',
    accent: '#fb923c',
    font: 'oswald',
    motif: 'arrow-up',
  },
  {
    id: 'mint-fresh',
    label: 'Mint Fresh',
    dark: { c1: '#6ee7b7', c2: '#34d399', c3: '#a7f3d0' },
    light: { c1: '#059669', c2: '#10b981', c3: '#0d9488' },
    pattern: 'dots',
    accent: '#34d399',
    font: 'sora',
    motif: 'bars',
  },
  {
    id: 'sunset-dip',
    label: 'Sunset Dip',
    dark: { c1: '#fb7185', c2: '#fbbf24', c3: '#a78bfa' },
    light: { c1: '#e11d48', c2: '#d97706', c3: '#7c3aed' },
    pattern: 'rings',
    accent: '#fb7185',
    font: 'playfair',
    motif: 'diamonds',
  },
  {
    id: 'cyber-grid',
    label: 'Cyber Grid',
    dark: { c1: '#38bdf8', c2: '#a3e635', c3: '#22d3ee' },
    light: { c1: '#0284c7', c2: '#65a30d', c3: '#0891b2' },
    pattern: 'grid',
    accent: '#38bdf8',
    font: 'bebas',
    motif: 'zigzag',
  },
];

export function getBackground(id: string): BackgroundDef {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexChannels(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `mixHex(color, target, t)` — color'ni target rang bilan aralashtiradi (t: 0..1). */
export function mixHex(hex: string, target: string, t: number): string {
  const [r1, g1, b1] = hexChannels(hex);
  const [r2, g2, b2] = hexChannels(target);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
