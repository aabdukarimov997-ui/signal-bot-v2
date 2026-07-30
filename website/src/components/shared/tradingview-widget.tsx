'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'dark';
  className?: string;
}

export function TradingViewWidget({
  symbol = 'BTCUSDT',
  theme = 'dark',
  className,
}: TradingViewWidgetProps) {
  const src = useMemo(() => {
    const params = new URLSearchParams({
      frameElementId: `tradingview_${symbol}`,
      symbol: `BINANCE:${symbol}`,
      interval: '15',
      hidesidetoolbar: '0',
      symboledit: '1',
      saveimage: '1',
      toolbarbg: '040303',
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
        key={symbol}
        src={src}
        title={`TradingView Chart - ${symbol}`}
        className="w-full h-[500px] md:h-[600px]"
        allowFullScreen
        style={{ border: 'none' }}
      />
    </div>
  );
}