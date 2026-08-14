'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { getBackground, hexToRgba, mixHex, DISPLAY_FONTS } from '@/lib/backgrounds';
import { MOTIFS } from '@/components/shared/background-motifs';
import { CoinLayer } from '@/components/shared/coin-layer';
import { useBackgroundStore } from '@/store';

function Pattern({ type, color }: { type: string; color: string }) {
  if (type === 'none') return null;
  const stroke = color;

  if (type === 'grid') {
    const lines: ReactElement[] = [];
    for (let x = 0; x <= 1200; x += 48) {
      lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={800} />);
    }
    for (let y = 0; y <= 800; y += 48) {
      lines.push(<line key={`h${y}`} x1={0} y1={y} x2={1200} y2={y} />);
    }
    return (
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g stroke={stroke} strokeWidth={1} fill="none">
          {lines}
        </g>
      </svg>
    );
  }

  if (type === 'dots') {
    const dots: ReactElement[] = [];
    for (let x = 0; x <= 1200; x += 48) {
      for (let y = 0; y <= 800; y += 48) {
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill={stroke} />);
      }
    }
    return (
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {dots}
      </svg>
    );
  }

  if (type === 'diagonal') {
    const lines: ReactElement[] = [];
    for (let x = -800; x <= 1200; x += 48) {
      lines.push(<line key={x} x1={x} y1={800} x2={x + 800} y2={0} />);
    }
    return (
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g stroke={stroke} strokeWidth={1} fill="none">
          {lines}
        </g>
      </svg>
    );
  }

  /* rings */
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <g stroke={stroke} strokeWidth={1} fill="none">
        <circle cx={180} cy={140} r={90} />
        <circle cx={180} cy={140} r={180} />
        <circle cx={180} cy={140} r={270} />
        <circle cx={1020} cy={680} r={110} />
        <circle cx={1020} cy={680} r={220} />
        <circle cx={1020} cy={680} r={330} />
      </g>
    </svg>
  );
}

export function SiteBackground() {
  const backgroundId = useBackgroundStore((s) => s.backgroundId);
  const [dark, setDark] = useState(false);

  /* tema (tungi/kunduzgi) o'zgarishini kuzatish */
  useEffect(() => {
    const html = document.documentElement;
    const apply = () => setDark(html.classList.contains('dark'));
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const bg = useMemo(() => getBackground(backgroundId), [backgroundId]);
  const pal = dark ? bg.dark : bg.light;

  /* Tanlangan fonga qarab butun temani qo'llash:
     aksent (matn, tugmalar, badge'lar), gradient matnlar, ring va h.k. */
  useEffect(() => {
    const root = document.documentElement;
    const em = pal.c1;
    const gold = pal.c2;
    const textBase = dark ? '#f5f7fc' : '#0e1626';
    const textSlate = dark ? '#cdd3e1' : '#3a4a63';
    const emFg = dark ? '#04140d' : '#ffffff';
    const goldFg = dark ? '#1a1203' : '#ffffff';

    root.style.setProperty('--emerald', em);
    root.style.setProperty('--emerald-foreground', emFg);
    root.style.setProperty('--gold', gold);
    root.style.setProperty('--gold-foreground', goldFg);
    root.style.setProperty('--primary', em);
    root.style.setProperty('--primary-foreground', emFg);
    root.style.setProperty('--ring', em);
    root.style.setProperty('--chart-1', em);
    root.style.setProperty('--chart-2', gold);
    root.style.setProperty('--glass-emerald-bg', hexToRgba(em, dark ? 0.06 : 0.08));
    root.style.setProperty('--glass-emerald-border', hexToRgba(em, dark ? 0.16 : 0.2));
    root.style.setProperty(
      '--gradient-text',
      `linear-gradient(120deg, ${textBase} 0%, ${textSlate} 30%, ${gold} 60%, ${em} 100%)`
    );
    root.style.setProperty(
      '--gradient-text-silver',
      `linear-gradient(120deg, ${textBase} 0%, ${textSlate} 45%, var(--muted-foreground) 100%)`
    );
    root.style.setProperty(
      '--gradient-text-emerald',
      `linear-gradient(120deg, ${mixHex(em, '#ffffff', dark ? 0.4 : 0.35)} 0%, ${em} 45%, ${mixHex(em, '#000000', 0.25)} 100%)`
    );
    root.style.setProperty(
      '--gradient-text-gold',
      `linear-gradient(120deg, ${mixHex(gold, '#ffffff', dark ? 0.4 : 0.35)} 0%, ${gold} 45%, ${mixHex(gold, '#000000', 0.25)} 100%)`
    );
    /* hardcoded emerald porlashlari uchun aksent soyalar */
    root.style.setProperty('--accent-glow-12', hexToRgba(em, 0.12));
    root.style.setProperty('--accent-glow-25', hexToRgba(em, 0.25));
    root.style.setProperty('--accent-glow-40', hexToRgba(em, 0.4));
    root.style.setProperty('--accent-pulse', hexToRgba(em, 0.5));

    /* Tanlangan fonning display shrifti.
       next/font `--font-display*` o'zgaruvchilarini BODY elementiga qo'yadi,
       shuning uchun zanjir ishlashi uchun override ham body'ga yoziladi. */
    const font = DISPLAY_FONTS[bg.font];
    const body = document.body;
    if (body) {
      if (font && font.id !== 'space-grotesk') {
        body.style.setProperty('--font-display', font.var);
      } else {
        body.style.removeProperty('--font-display');
      }
    }
  }, [pal, dark, bg]);

  const layerStyle = useMemo(() => {
    const a = dark ? 0.11 : 0.15;
    return {
      backgroundImage: [
        `radial-gradient(ellipse 80% 60% at 50% -10%, ${hexToRgba(pal.c1, a)} 0%, transparent 60%)`,
        `radial-gradient(ellipse 60% 50% at 90% 110%, ${hexToRgba(pal.c2, a)} 0%, transparent 60%)`,
        `radial-gradient(ellipse 50% 40% at 8% 85%, ${hexToRgba(pal.c3, a)} 0%, transparent 55%)`,
      ].join(', '),
    };
  }, [pal, dark]);

  const patternColor = hexToRgba(bg.accent, dark ? 0.05 : 0.08);
  const motifColor = hexToRgba(bg.accent, dark ? 0.1 : 0.14);
  const orbA = hexToRgba(bg.accent, dark ? 0.1 : 0.12);
  const orbB = hexToRgba(pal.c2, dark ? 0.08 : 0.1);
  const motif = useMemo(() => MOTIFS[bg.motif]?.(motifColor), [bg.motif, motifColor]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* rangli yorug'lik qatlami */}
      <div className="absolute inset-0" style={layerStyle} />
      {/* pattern */}
      <Pattern type={bg.pattern} color={patternColor} />
      {/* o'ziga xos motiv (rasim) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {motif}
      </svg>
      {/* yumshoq orblar */}
      <div
        className="glow-orb -top-24 left-[8%] h-[380px] w-[540px]"
        style={{ backgroundColor: orbA }}
      />
      <div
        className="glow-orb -bottom-32 right-[4%] h-[440px] w-[460px]"
        style={{ backgroundColor: orbB }}
      />
      {/* suzib yuruvchi tangalar (BTC, ETH, SOL, TON, XRP) */}
      <CoinLayer />
    </div>
  );
}
