'use client';

import React from 'react';

// Decorative top border with national pattern
export function TopOrnament() {
  return (
    <div className="relative w-full h-8 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="15%" stopColor="#d4a72c" />
            <stop offset="50%" stopColor="#f0d78c" />
            <stop offset="85%" stopColor="#d4a72c" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Arch pattern */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <path
            key={i}
            d={`M ${i * 40} 32 Q ${i * 40 + 10} 8 ${i * 40 + 20} 16 Q ${i * 40 + 30} 24 ${i * 40 + 40} 32`}
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="0.8"
            opacity="0.7"
          />
        ))}
        {/* Horizontal line */}
        <line x1="0" y1="31" x2="400" y2="31" stroke="url(#goldGrad)" strokeWidth="0.7" opacity="0.5" />
        {/* Diamond shapes */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <polygon
            key={`diamond-${i}`}
            points={`${i * 40 + 20},4 ${i * 40 + 24},8 ${i * 40 + 20},12 ${i * 40 + 16},8`}
            fill="rgba(212, 167, 44, 0.3)"
            stroke="rgba(212, 167, 44, 0.4)"
            strokeWidth="0.5"
          />
        ))}
      </svg>
    </div>
  );
}

// Georgian/Turkic star pattern
export function StarPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.09 8.26L18 5.34L14.44 10.56L20 12L14.44 13.44L18 18.66L13.09 15.74L12 22L10.91 15.74L6 18.66L9.56 13.44L4 12L9.56 10.56L6 5.34L10.91 8.26L12 2Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

// Samarqand Sher-Dor uslubidagi geometrik fon (Rub al-Hizb yulduzlari)
export function GeometricBg({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none opacity-[0.09] text-[#d4a72c] ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 160 160" preserveAspectRatio="none">
        <defs>
          <pattern id="geo-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Rub al-Hizb — 8 qirrali yulduz */}
            <polygon points="40,10 47.5,25 62.5,32.5 47.5,40 40,55 32.5,40 17.5,32.5 32.5,25" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
            <polygon points="40,26 44,34 52,36 44,38 40,46 36,38 28,36 36,34" fill="none" stroke="rgba(47,184,160,0.8)" strokeWidth="0.5" opacity="0.7" />
            {/* Diagonal chiziqlar */}
            <line x1="0" y1="0" x2="80" y2="80" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
            <line x1="80" y1="0" x2="0" y2="80" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
            {/* Kichik yulduzlar */}
            <polygon points="10,10 12,15 17,16 13,18 14,23 10,20 6,23 7,18 3,16 8,15" fill="currentColor" opacity="0.6" />
            <polygon points="70,70 72,75 77,76 73,78 74,83 70,80 66,83 67,78 63,76 68,75" fill="currentColor" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo-pattern)" />
      </svg>
    </div>
  );
}

// Decorative divider with uzbek pattern
export function DecorativeDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 my-4 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4a72c]/60 to-transparent" />
      <svg className="w-6 h-6 text-[#d4a72c]/70" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4a72c]/60 to-transparent" />
    </div>
  );
}

// National frame/border for cards
export function NationalFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative p-4 rounded-2xl border border-[#d4a72c]/25 bg-gradient-to-br from-[#0f2b1f]/40 via-[#0a0a09]/60 to-[#1a0f0a]/40 ${className}`}>
      {/* Corner ornaments */}
      <svg className="absolute top-0 left-0 w-8 h-8 text-[#d4a72c]/40" viewBox="0 0 32 32" fill="none">
        <path d="M0 0h8v2H2v6H0V0z" fill="currentColor" />
        <path d="M0 32h8v-2H2v-6H0v8z" fill="currentColor" />
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8" />
      </svg>
      <svg className="absolute top-0 right-0 w-8 h-8 text-[#d4a72c]/40 rotate-90" viewBox="0 0 32 32" fill="none">
        <path d="M0 0h8v2H2v6H0V0z" fill="currentColor" />
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-8 h-8 text-[#d4a72c]/40 -rotate-90" viewBox="0 0 32 32" fill="none">
        <path d="M0 0h8v2H2v6H0V0z" fill="currentColor" />
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-8 h-8 text-[#d4a72c]/40 rotate-180" viewBox="0 0 32 32" fill="none">
        <path d="M0 0h8v2H2v6H0V0z" fill="currentColor" />
        <circle cx="4" cy="4" r="1" fill="currentColor" opacity="0.8" />
      </svg>
      {children}
    </div>
  );
}

// Language flag/indicator
export function LangIndicator({ lang }: { lang: string }) {
  const flags: Record<string, string> = {
    uz: '🇺🇿',
    en: '🇬🇧',
    ru: '🇷🇺',
  };
  return <span>{flags[lang] || '🌐'}</span>;
}
