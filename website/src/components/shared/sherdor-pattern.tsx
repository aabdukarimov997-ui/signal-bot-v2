'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────
   SAMARQAND SHER-DOR naqshlari
   Sher-Dor madrasasi (Registon, Samarqand) koshinlaridan ilhomlangan:
   - Rub al-Hizb 8 qirrali yulduzlar
   - Islimi (gul novdali) naqshlar
   - Sher va quyosh motivi
   - Xos ranglar: firuza, ultramarin ko'k, tilla, terakota
   ──────────────────────────────────────────────────────────────── */

/* Samarqand koshinlarining xos ranglari */
const FIRUZA = '#2fb8a0';
const FIRUZA_DARK = '#1d8a78';
const ULTRAMARIN = '#2b4a7d';
const TERRAKOTA = '#b3562f';

/* ───── Rub al-Hizb (8 qirrali yulduz) fon naqshi ───── */
export function SamarkandStarPattern({ className, opacity = 0.07 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden text-gold', className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="samarkand-star"
            x="0"
            y="0"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            {/* Rub al-Hizb — 8 qirrali yulduz (ikkita kvadrat kesishuvi) */}
            <polygon
              points="80,20 95,50 125,65 95,80 80,110 65,80 35,65 65,50"
              fill="currentColor"
              opacity={opacity}
            />
            {/* Yulduz atrofidagi khatam (halqa) */}
            <polygon
              points="80,20 95,50 125,65 95,80 80,110 65,80 35,65 65,50"
              fill="none"
              stroke={FIRUZA}
              strokeOpacity={opacity * 1.2}
              strokeWidth="0.8"
            />
            {/* Ichki kichik yulduz — firuza */}
            <polygon
              points="80,52 87,68 103,72 87,76 80,92 73,76 57,72 73,68"
              fill={FIRUZA}
              opacity={opacity * 1.4}
            />
            {/* Markaziy nuqta — tilla */}
            <circle cx="80" cy="72" r="4" fill="currentColor" opacity={opacity * 1.5} />
            {/* Diagonal to'r chiziqlari — ultramarin */}
            <line x1="0" y1="0" x2="160" y2="160" stroke={ULTRAMARIN} strokeOpacity={opacity * 0.8} strokeWidth="0.5" />
            <line x1="160" y1="0" x2="0" y2="160" stroke={ULTRAMARIN} strokeOpacity={opacity * 0.8} strokeWidth="0.5" />
            {/* Burchaklardagi kichik yulduzlar */}
            <polygon
              points="20,10 24,20 34,22 24,24 20,34 16,24 6,22 16,20"
              fill="currentColor"
              opacity={opacity * 0.8}
            />
            <polygon
              points="140,10 144,20 154,22 144,24 140,34 136,24 126,22 136,20"
              fill="currentColor"
              opacity={opacity * 0.8}
            />
            <polygon
              points="20,150 24,140 34,138 24,136 20,126 16,136 6,138 16,140"
              fill="currentColor"
              opacity={opacity * 0.8}
            />
            <polygon
              points="140,150 144,140 154,138 144,136 140,126 136,136 126,138 136,140"
              fill="currentColor"
              opacity={opacity * 0.8}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#samarkand-star)" />
      </svg>
    </div>
  );
}

/* ───── Islimi (gul novdali) naqsh — Samarqand uslubi ───── */
export function SherDorArabesque({ className, opacity = 0.05 }: { className?: string; opacity?: number }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden text-gold', className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="sherdor-arabesque"
            x="0"
            y="0"
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
          >
            {/* Gul novdasi — islimi */}
            <path
              d="M75,0 C95,25 55,40 75,65 C95,90 55,105 75,130 C95,145 85,150 75,150 M75,0 C55,25 95,40 75,65 C55,90 95,105 75,130"
              stroke="currentColor"
              strokeOpacity={opacity * 1.1}
              strokeWidth="0.8"
              fill="none"
            />
            {/* Gul (to'rt bargli — lola shakli) */}
            <g fill={FIRUZA} opacity={opacity * 1.5}>
              <ellipse cx="75" cy="45" rx="9" ry="5" transform="rotate(-30 75 45)" />
              <ellipse cx="75" cy="45" rx="9" ry="5" transform="rotate(30 75 45)" />
              <ellipse cx="75" cy="40" rx="4" ry="6" />
            </g>
            <circle cx="75" cy="45" r="2.5" fill="currentColor" opacity={opacity * 1.8} />
            {/* Barglar — firuza */}
            <path
              d="M50,80 Q65,70 75,80 Q65,90 50,80 Z M100,80 Q85,70 75,80 Q85,90 100,80 Z"
              fill={ULTRAMARIN}
              opacity={opacity * 1.2}
            />
            {/* Kichik yulduzchalar */}
            <polygon
              points="30,30 33,37 40,38 34,42 36,49 30,45 24,49 26,42 20,38 27,37"
              fill="currentColor"
              opacity={opacity * 0.9}
            />
            <polygon
              points="120,120 123,127 130,128 124,132 126,139 120,135 114,139 116,132 110,128 117,127"
              fill="currentColor"
              opacity={opacity * 0.9}
            />
            {/* Terakota aktsent */}
            <circle cx="75" cy="105" r="3" fill={TERRAKOTA} opacity={opacity * 1.3} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sherdor-arabesque)" />
      </svg>
    </div>
  );
}

/* ───── Sher va quyosh motivi (Sher-Dor ramzi) ───── */
export function SherDorLion({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-gold', className)}
    >
      {/* Quyosh */}
      <circle cx="60" cy="22" r="16" fill="currentColor" opacity="0.85" />
      <circle cx="60" cy="22" r="16" fill="none" stroke={FIRUZA} strokeOpacity="0.5" strokeWidth="1" />
      {/* Quyosh nurlari */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="22"
          x2="60"
          y2="2"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.7"
          transform={`rotate(${deg} 60 22)`}
        />
      ))}
      {/* Quyosh ichidagi kichik yulduz */}
      <polygon
        points="60,12 63,19 70,20 64,24 66,31 60,27 54,31 56,24 50,20 57,19"
        fill={ULTRAMARIN}
        opacity="0.7"
      />
      {/* Sher tanasi */}
      <path
        d="M28,62 C32,48 48,42 66,42 C82,42 92,52 94,62 C95,68 90,72 84,72 L36,72 C30,72 27,68 28,62 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Sher boshi (o'ng tomonda) */}
      <path
        d="M78,44 C88,42 96,48 97,56 C98,62 92,66 86,66 C82,66 78,63 76,60 C74,54 74,48 78,44 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Quloq */}
      <path d="M86,44 L90,40 L92,46 Z" fill="currentColor" opacity="0.8" />
      {/* Ko'z */}
      <circle cx="90" cy="54" r="1.5" fill={ULTRAMARIN} opacity="0.9" />
      {/* Dum */}
      <path
        d="M30,56 C20,52 16,60 22,64 C26,66 32,62 30,58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Oyoqlar */}
      <line x1="42" y1="70" x2="40" y2="78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="60" y1="70" x2="60" y2="78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="76" y1="70" x2="78" y2="78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      {/* Yelka naqshi — firuza */}
      <path d="M52,48 Q60,44 68,48" stroke={FIRUZA} strokeWidth="1" opacity="0.8" fill="none" />
    </svg>
  );
}

/* ───── Samarqand uslubidagi burchak ornamenti ───── */
export function SherDorCorner({ className, position = 'top-left' }: { className?: string; position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotation: Record<string, string> = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-left': '-rotate-90',
    'bottom-right': 'rotate-180',
  };

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute size-20 sm:size-28 text-gold/50',
        rotation[position],
        position.includes('top') ? 'top-0' : 'bottom-0',
        position.includes('left') ? 'left-0' : 'right-0',
        className
      )}
    >
      <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
        {/* Burchak ramkasi — tilla */}
        <path
          d="M0 0 L100 0 L100 7 Q50 7, 7 50 L7 100 L0 100 Z"
          fill="currentColor"
          opacity="0.35"
        />
        {/* Ichki ramka — firuza */}
        <path
          d="M0 0 L82 0 L82 5 Q41 5, 5 41 L5 82 L0 82 Z"
          fill={FIRUZA}
          opacity="0.22"
        />
        {/* Rub al-Hizb yulduzi */}
        <polygon
          points="30,6 37,20 52,24 37,28 30,42 23,28 8,24 23,20"
          fill="currentColor"
          opacity="0.65"
        />
        <polygon
          points="30,16 34,24 42,26 34,28 30,36 26,28 18,26 26,24"
          fill={FIRUZA}
          opacity="0.8"
        />
        {/* Islimi novda */}
        <path
          d="M0,55 Q15,40 30,45 Q45,50 50,62 M0,70 Q18,58 34,62"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.6"
          fill="none"
        />
        {/* Gul */}
        <ellipse cx="45" cy="58" rx="5" ry="3" transform="rotate(-25 45 58)" fill={FIRUZA} opacity="0.7" />
        <circle cx="45" cy="56" r="1.8" fill="currentColor" opacity="0.8" />
        {/* Nuqta — terakota */}
        <circle cx="8" cy="8" r="3" fill={TERRAKOTA} opacity="0.7" />
        <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.9" />
        {/* Chegara chiziqlari */}
        <path d="M0 0 L60 0 Q30 0, 0 30" stroke={ULTRAMARIN} strokeOpacity="0.5" strokeWidth="0.6" fill="none" />
      </svg>
    </div>
  );
}

/* ───── Samarqand naqshli chegara tasmasi (yuqori/pastki) ───── */
export function SherDorBorder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none relative h-10 w-full overflow-hidden text-gold/90', className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 40"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sherdor-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="12%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="88%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Haqlin chiziqlar */}
        <line x1="0" y1="0.5" x2="600" y2="0.5" stroke="url(#sherdor-gold)" strokeWidth="0.7" opacity="0.6" />
        <line x1="0" y1="39.5" x2="600" y2="39.5" stroke="url(#sherdor-gold)" strokeWidth="0.7" opacity="0.5" />
        {/* Takrorlanuvchi motif */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = i * 60;
          return (
            <g key={i}>
              {/* Rub al-Hizb yulduzi — markaz */}
              <polygon
                points={`${x + 30},6 ${x + 38},20 ${x + 54},24 ${x + 38},28 ${x + 30},42 ${x + 22},28 ${x + 6},24 ${x + 22},20`}
                fill="url(#sherdor-gold)"
                opacity="0.9"
              />
              <polygon
                points={`${x + 30},16 ${x + 34},24 ${x + 42},26 ${x + 34},28 ${x + 30},36 ${x + 26},28 ${x + 18},26 ${x + 26},24`}
                fill={FIRUZA}
                opacity="0.75"
              />
              {/* Yon yulduzchalar */}
              <polygon
                points={`${x + 12},30 ${x + 14},35 ${x + 20},36 ${x + 15},38 ${x + 16},44 ${x + 12},40 ${x + 8},44 ${x + 9},38 ${x + 4},36 ${x + 10},35`}
                fill="url(#sherdor-gold)"
                opacity="0.7"
              />
              <polygon
                points={`${x + 48},30 ${x + 50},35 ${x + 56},36 ${x + 51},38 ${x + 52},44 ${x + 48},40 ${x + 44},44 ${x + 45},38 ${x + 40},36 ${x + 46},35`}
                fill="url(#sherdor-gold)"
                opacity="0.7"
              />
              {/* Ark / islimi chizig'i */}
              <path
                d={`M ${x} 40 Q ${x + 15} 8 ${x + 30} 20 Q ${x + 45} 32 ${x + 60} 40`}
                stroke="url(#sherdor-gold)"
                strokeWidth="1.2"
                opacity="0.85"
                fill="none"
              />
              {/* Terakota nuqtalar */}
              <circle cx={x + 30} cy="8" r="1.5" fill={TERRAKOTA} opacity="0.8" />
              <circle cx={x + 15} cy="34" r="1.2" fill={FIRUZA_DARK} opacity="0.8" />
              <circle cx={x + 45} cy="34" r="1.2" fill={FIRUZA_DARK} opacity="0.8" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───── Samarqand uslubidagi ajratgich ───── */
export function SherDorDivider({ className, variant = 'full' }: { className?: string; variant?: 'full' | 'simple' }) {
  if (variant === 'simple') {
    return (
      <div className={cn('relative flex items-center justify-center py-6', className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="mx-4 flex items-center gap-2">
          <div className="size-1.5 rotate-45 bg-firuza" />
          <div className="size-2 rotate-45 bg-gold/50" />
          <div className="size-1.5 rotate-45 bg-firuza" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn('relative flex items-center justify-center py-8', className)}>
      <svg
        width="240"
        height="26"
        viewBox="0 0 240 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gold/50"
      >
        {/* Chap islimi novda */}
        <path d="M0 13 C15 3, 30 3, 42 13 C54 23, 69 23, 82 13" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.8" />
        {/* Rub al-Hizb — markaziy yulduz */}
        <polygon
          points="120,4 127,14 140,17 127,20 120,30 113,20 100,17 113,14"
          fill="currentColor"
          opacity="0.9"
        />
        <polygon
          points="120,11 123,17 130,19 123,21 120,27 117,21 110,19 117,17"
          fill={FIRUZA}
          opacity="0.85"
        />
        {/* Kichik yulduzchalar */}
        <polygon
          points="100,17 102,21 107,22 103,24 104,28 100,26 96,28 97,24 93,22 98,21"
          fill="currentColor"
          opacity="0.7"
        />
        <polygon
          points="140,17 142,21 147,22 143,24 144,28 140,26 136,28 137,24 133,22 138,21"
          fill="currentColor"
          opacity="0.7"
        />
        {/* O'ng islimi novda */}
        <path d="M158 13 C171 3, 186 3, 198 13 C210 23, 225 23, 240 13" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.8" />
      </svg>
    </div>
  );
}

/* ───── Samarqand naqshli ramka (karta atrofi uchun) ───── */
export function SherDorFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Burchak bezaklari — tilla + firuza */}
      <div className="pointer-events-none absolute -top-0.5 -left-0.5 size-3 border-t-2 border-l-2 border-gold/50" />
      <div className="pointer-events-none absolute -top-0.5 -right-0.5 size-3 border-t-2 border-r-2 border-gold/50" />
      <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 size-3 border-b-2 border-l-2 border-gold/50" />
      <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 size-3 border-b-2 border-r-2 border-gold/50" />
      {/* Ichki firuza burchaklar */}
      <div className="pointer-events-none absolute -top-1 -left-1 size-2 border-t border-l border-firuza/60" />
      <div className="pointer-events-none absolute -top-1 -right-1 size-2 border-t border-r border-firuza/60" />
      <div className="pointer-events-none absolute -bottom-1 -left-1 size-2 border-b border-l border-firuza/60" />
      <div className="pointer-events-none absolute -bottom-1 -right-1 size-2 border-b border-r border-firuza/60" />
      {children}
    </div>
  );
}
