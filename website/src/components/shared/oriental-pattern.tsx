'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ───── Background Pattern: Islamic Geometric Star ───── */
export function GeometricPattern({ className, opacity = 0.06 }: { className?: string; opacity?: number }) {
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
            id="islamic-geo"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star */}
            <polygon
              points="60,0 72,28 105,25 90,50 120,60 90,70 105,95 72,92 60,120 48,92 15,95 30,70 0,60 30,50 15,25 48,28"
              fill="currentColor"
              opacity={opacity}
            />
            {/* Small diamonds between stars */}
            <polygon
              points="120,0 126,12 120,24 114,12"
              fill="currentColor"
              opacity={opacity * 0.7}
            />
            <polygon
              points="0,0 6,12 0,24 -6,12"
              fill="currentColor"
              opacity={opacity * 0.7}
            />
            {/* Connecting lines */}
            <line
              x1="60" y1="0" x2="60" y2="120"
              stroke="currentColor"
              strokeOpacity={opacity * 0.5}
              strokeWidth="0.7"
            />
            <line
              x1="0" y1="60" x2="120" y2="60"
              stroke="currentColor"
              strokeOpacity={opacity * 0.5}
              strokeWidth="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-geo)" />
      </svg>
    </div>
  );
}

/* ───── Background Pattern: Arabesque / Floral ───── */
export function ArabesquePattern({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
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
            id="arabesque"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Curved arabesque vines */}
            <path
              d="M60,0 C80,20 100,5 120,20 M0,60 C20,40 5,20 20,0 M60,120 C80,100 100,115 120,100 M120,60 C100,80 115,100 100,120"
              stroke="currentColor"
              strokeOpacity={opacity * 0.8}
              strokeWidth="0.7"
              fill="none"
            />
            {/* Leaf shapes */}
            <ellipse
              cx="60" cy="30" rx="8" ry="4"
              transform="rotate(30,60,30)"
              fill="currentColor"
              opacity={opacity}
            />
            <ellipse
              cx="90" cy="60" rx="8" ry="4"
              transform="rotate(120,90,60)"
              fill="currentColor"
              opacity={opacity}
            />
            <ellipse
              cx="60" cy="90" rx="8" ry="4"
              transform="rotate(210,60,90)"
              fill="currentColor"
              opacity={opacity}
            />
            <ellipse
              cx="30" cy="60" rx="8" ry="4"
              transform="rotate(300,30,60)"
              fill="currentColor"
              opacity={opacity}
            />
            {/* Center motif */}
            <circle
              cx="60" cy="60" r="6"
              fill="currentColor"
              opacity={opacity * 0.6}
            />
            <circle
              cx="60" cy="60" r="2"
              fill="currentColor"
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arabesque)" />
      </svg>
    </div>
  );
}

/* ───── Decorative Border Divider ───── */
export function OrientalDivider({ className, variant = 'full' }: { className?: string; variant?: 'full' | 'simple' }) {
  if (variant === 'simple') {
    return (
      <div className={cn('relative flex items-center justify-center py-6', className)}>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="mx-4 flex items-center gap-2">
          <div className="size-1.5 rotate-45 bg-gold/60" />
          <div className="size-2 rotate-45 bg-gold/40" />
          <div className="size-1.5 rotate-45 bg-gold/60" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn('relative flex items-center justify-center py-8', className)}>
      <svg
        width="200"
        height="24"
        viewBox="0 0 200 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gold/40"
      >
        {/* Left arabesque arc */}
        <path
          d="M0 12 C20 0, 40 0, 50 12"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Left small diamond */}
        <polygon
          points="55,12 58,8 61,12 58,16"
          fill="currentColor"
          opacity="0.6"
        />
        {/* Decorative line with center star */}
        <line x1="62" y1="12" x2="80" y2="12" stroke="currentColor" strokeWidth="0.5" />
        {/* 8-pointed star center */}
        <polygon
          points="100,4 103,10 110,10 105,14 107,20 100,16 93,20 95,14 90,10 97,10"
          fill="currentColor"
          opacity="0.8"
        />
        <line x1="80" y1="12" x2="90" y2="12" stroke="currentColor" strokeWidth="0.5" />
        {/* Right diamond */}
        <polygon
          points="139,12 142,8 145,12 142,16"
          fill="currentColor"
          opacity="0.6"
        />
        {/* Right arabesque arc */}
        <path
          d="M150 12 C160 0, 180 0, 200 12"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ───── Corner Ornaments ───── */
export function CornerOrnament({ className, position = 'top-left' }: { className?: string; position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
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
        'pointer-events-none absolute size-20 sm:size-28 text-gold/45',
        rotation[position],
        position.includes('top') ? 'top-0' : 'bottom-0',
        position.includes('left') ? 'left-0' : 'right-0',
        className
      )}
    >
      <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
        <path
          d="M0 0 L100 0 L100 6 Q50 6, 6 50 L6 100 L0 100 Z"
          fill="currentColor"
          opacity="0.35"
        />
        <path
          d="M0 0 L80 0 Q40 0, 0 40"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M0 0 L60 0 Q30 0, 0 30"
          stroke="currentColor"
          strokeWidth="0.6"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M0 0 L40 0 Q20 0, 0 20"
          stroke="currentColor"
          strokeWidth="0.4"
          fill="none"
          opacity="0.4"
        />
        {/* 8-pointed star inside the corner */}
        <polygon
          points="30,4 32,10 38,10 33.5,13.5 35,20 30,16.5 25,20 26.5,13.5 22,10 28,10"
          fill="currentColor"
          opacity="0.5"
        />
        <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.9" />
      </svg>
    </div>
  );
}

/* ───── Decorative Pattern Border Strip (top/bottom) ───── */
export function PatternBorder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none relative h-9 w-full overflow-hidden text-gold/90', className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 36"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pb-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="12%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="88%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* hairlines */}
        <line x1="0" y1="0.5" x2="600" y2="0.5" stroke="url(#pb-gold)" strokeWidth="0.6" opacity="0.6" />
        <line x1="0" y1="35.5" x2="600" y2="35.5" stroke="url(#pb-gold)" strokeWidth="0.6" opacity="0.5" />
        {/* repeating motif */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = i * 60;
          return (
            <g key={i}>
              {/* arch */}
              <path
                d={`M ${x} 36 Q ${x + 15} 4 ${x + 30} 16 Q ${x + 45} 28 ${x + 60} 36`}
                stroke="url(#pb-gold)"
                strokeWidth="1.2"
                fill="none"
                opacity="0.85"
              />
              {/* top diamond */}
              <polygon points={`${x + 30},2 ${x + 34},7 ${x + 30},12 ${x + 26},7`} fill="url(#pb-gold)" opacity="0.9" />
              {/* side diamonds */}
              <polygon points={`${x + 15},21 ${x + 17},24 ${x + 15},27 ${x + 13},24`} fill="url(#pb-gold)" opacity="0.5" />
              <polygon points={`${x + 45},21 ${x + 47},24 ${x + 45},27 ${x + 43},24`} fill="url(#pb-gold)" opacity="0.5" />
              {/* 8-pointed star center */}
              <polygon
                points={`${x + 30},17 ${x + 31.5},21 ${x + 36},21 ${x + 32.5},23.5 ${x + 33.5},28 ${x + 30},25 ${x + 26.5},28 ${x + 27.5},23.5 ${x + 24},21 ${x + 28.5},21`}
                fill="url(#pb-gold)"
                opacity="0.8"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───── Vertical Side Pattern Strip (left/right edges) ───── */
export function SidePattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-y-0 w-8 overflow-hidden text-gold/60', className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 32 160"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sp-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="10%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="90%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* vertical hairlines */}
        <line x1="1" y1="0" x2="1" y2="160" stroke="url(#sp-gold)" strokeWidth="0.6" opacity="0.6" />
        <line x1="31" y1="0" x2="31" y2="160" stroke="url(#sp-gold)" strokeWidth="0.6" opacity="0.6" />
        {Array.from({ length: 5 }).map((_, i) => {
          const y = i * 32;
          return (
            <g key={i}>
              {/* diamond */}
              <polygon
                points={`16,${y + 16} 20,${y + 21} 16,${y + 26} 12,${y + 21}`}
                fill="url(#sp-gold)"
                opacity="0.75"
              />
              {/* small dots */}
              <circle cx="16" cy={y + 5} r="2" fill="url(#sp-gold)" opacity="0.5" />
              <circle cx="16" cy={y + 27} r="2" fill="url(#sp-gold)" opacity="0.5" />
              {/* arabesque vine */}
              <path
                d={`M 16 ${y} C 23 ${y + 4}, 23 ${y + 12}, 16 ${y + 16} M 16 ${y + 16} C 9 ${y + 20}, 9 ${y + 28}, 16 ${y + 32}`}
                stroke="url(#sp-gold)"
                strokeWidth="0.6"
                fill="none"
                opacity="0.7"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───── Gold Border Frame ───── */
export function GoldFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Corner decorations */}
      <div className="pointer-events-none absolute -top-0.5 -left-0.5 size-3 border-t-2 border-l-2 border-gold/40" />
      <div className="pointer-events-none absolute -top-0.5 -right-0.5 size-3 border-t-2 border-r-2 border-gold/40" />
      <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 size-3 border-b-2 border-l-2 border-gold/40" />
      <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 size-3 border-b-2 border-r-2 border-gold/40" />
      {children}
    </div>
  );
}
