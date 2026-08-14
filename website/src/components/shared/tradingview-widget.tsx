'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface TradingViewWidgetProps {
  symbol?: string;
  className?: string;
}

export function TradingViewWidget({
  symbol = 'BTCUSDT',
  className,
}: TradingViewWidgetProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setTheme(mq.matches ? 'dark' : 'light');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const src = useMemo(() => {
    const params = new URLSearchParams({
      frameElementId: `tradingview_${symbol}`,
      symbol: `BINANCE:${symbol}`,
      interval: '15',
      hidesidetoolbar: '0',
      symboledit: '1',
      saveimage: '1',
      toolbarbg: theme === 'dark' ? '040303' : 'ffffff',
      studies: '[]',
      theme,
      style: '1',
      timezone: 'Asia/Tashkent',
      withdateranges: '1',
      showpopupbutton: '0',
      'studies_overrides': '{}',
      'overrides': '{}',
      'enabled_features': '[]',
      'disabled_features': '[]',
      locale: 'ru',
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [symbol, theme]);

  return (
    <div
      className={cn(
        'glass-card overflow-hidden rounded-xl',
        className
      )}
    >
      <iframe
        key={`${symbol}-${theme}`}
        src={src}
        title={`TradingView Chart - ${symbol}`}
        className="w-full h-[500px] md:h-[600px]"
        allowFullScreen
        style={{ border: 'none' }}
      />
    </div>
  );
}
