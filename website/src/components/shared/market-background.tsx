'use client';

// Admin panel orqa fon — yashil buqa, qizil ayiq va grafik chiziqlari
export function MarketBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 15% 20%, rgba(16,185,129,0.08), transparent 45%),' +
          'radial-gradient(ellipse at 85% 80%, rgba(239,68,68,0.08), transparent 45%),' +
          'linear-gradient(180deg, var(--background) 0%, rgba(16,185,129,0.03) 100%)',
      }}
    >
      {/* Grafik chiziqlari — yashil (bull) va qizil (bear) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="bullLine" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="30%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="bearLine" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bullFill" x1="0" y1="900" x2="0" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bearFill" x1="0" y1="900" x2="0" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Yashil grafik — ko'tarilayotgan (bull) */}
        <path
          d="M0 700 C 100 680, 150 620, 240 640 C 330 660, 360 560, 450 570 C 540 580, 580 480, 670 500 C 760 520, 800 400, 900 430 C 1000 460, 1040 330, 1130 350 C 1220 370, 1260 240, 1350 260 C 1400 270, 1420 200, 1440 210 L 1440 900 L 0 900 Z"
          fill="url(#bullFill)"
        />
        <path
          d="M0 700 C 100 680, 150 620, 240 640 C 330 660, 360 560, 450 570 C 540 580, 580 480, 670 500 C 760 520, 800 400, 900 430 C 1000 460, 1040 330, 1130 350 C 1220 370, 1260 240, 1350 260 C 1400 270, 1420 200, 1440 210"
          stroke="url(#bullLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Qizil grafik — tushayotgan (bear) */}
        <path
          d="M0 300 C 100 320, 150 380, 240 360 C 330 340, 360 440, 450 430 C 540 420, 580 520, 670 500 C 760 480, 800 580, 900 560 C 1000 540, 1040 640, 1130 620 C 1220 600, 1260 700, 1350 690 C 1400 685, 1420 750, 1440 740 L 1440 900 L 0 900 Z"
          fill="url(#bearFill)"
        />
        <path
          d="M0 300 C 100 320, 150 380, 240 360 C 330 340, 360 440, 450 430 C 540 420, 580 520, 670 500 C 760 480, 800 580, 900 560 C 1000 540, 1040 640, 1130 620 C 1220 600, 1260 700, 1350 690 C 1400 685, 1420 750, 1440 740"
          stroke="url(#bearLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Grafik nuqtalari */}
        <circle cx="450" cy="570" r="4" fill="#10b981" opacity="0.5" />
        <circle cx="670" cy="500" r="4" fill="#10b981" opacity="0.5" />
        <circle cx="900" cy="430" r="4" fill="#10b981" opacity="0.5" />
        <circle cx="1130" cy="350" r="4" fill="#10b981" opacity="0.5" />
        <circle cx="450" cy="430" r="4" fill="#ef4444" opacity="0.5" />
        <circle cx="670" cy="500" r="4" fill="#ef4444" opacity="0.5" />
        <circle cx="900" cy="560" r="4" fill="#ef4444" opacity="0.5" />
        <circle cx="1130" cy="620" r="4" fill="#ef4444" opacity="0.5" />

        {/* Grid chiziqlari */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={'h' + i}
            x1="0"
            y1={i * 112}
            x2="1440"
            y2={i * 112}
            stroke={i % 2 === 0 ? '#10b981' : '#ef4444'}
            strokeOpacity="0.04"
            strokeWidth="1"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={'v' + i}
            x1={i * 160}
            y1="0"
            x2={i * 160}
            y2="900"
            stroke="#888888"
            strokeOpacity="0.04"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Yashil buqa (bull) — pastki o'ng */}
      <svg
        className="absolute bottom-4 right-6 w-40 h-40 opacity-[0.10]"
        viewBox="0 0 100 100"
        fill="#10b981"
      >
        <ellipse cx="50" cy="62" rx="32" ry="24" />
        <rect x="34" y="38" width="32" height="14" rx="7" />
        <circle cx="40" cy="36" r="3" />
        <circle cx="60" cy="36" r="3" />
        {/* Shoxlar */}
        <path d="M36 30 C 28 22, 20 26, 20 32 C 26 30, 32 30, 36 30 Z" fill="#fbbf24" />
        <path d="M64 30 C 72 22, 80 26, 80 32 C 74 30, 68 30, 64 30 Z" fill="#fbbf24" />
        {/* Yuz */}
        <ellipse cx="50" cy="60" rx="14" ry="11" fill="#d1fae5" opacity="0.8" />
        <circle cx="45" cy="58" r="2" fill="#064e3b" />
        <circle cx="55" cy="58" r="2" fill="#064e3b" />
        <path d="M45 64 Q 50 68, 55 64" stroke="#064e3b" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Qizil ayiq (bear) — chap yuqori */}
      <svg
        className="absolute top-6 left-6 w-44 h-44 opacity-[0.10]"
        viewBox="0 0 100 100"
        fill="#ef4444"
      >
        {/* Tana */}
        <ellipse cx="50" cy="66" rx="34" ry="26" />
        {/* Bosh */}
        <circle cx="50" cy="34" r="16" />
        {/* Quloqlar */}
        <circle cx="38" cy="22" r="6" />
        <circle cx="62" cy="22" r="6" />
        {/* Yuz */}
        <ellipse cx="50" cy="38" rx="9" ry="8" fill="#fecaca" opacity="0.7" />
        <circle cx="46" cy="36" r="2" fill="#7f1d1d" />
        <circle cx="54" cy="36" r="2" fill="#7f1d1d" />
        <ellipse cx="50" cy="41" rx="3" ry="2.5" fill="#7f1d1d" />
        {/* Penceler */}
        <ellipse cx="22" cy="78" rx="8" ry="6" />
        <ellipse cx="78" cy="78" rx="8" ry="6" />
      </svg>
    </div>
  );
}
