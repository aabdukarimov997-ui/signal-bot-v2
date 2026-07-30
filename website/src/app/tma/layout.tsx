'use client';

import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import { LanguageProvider } from '@/components/tma/shared/LanguageProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function TmaLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Telegram WebApp initialization
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
        // Set theme colors to match Uzbek design
        tg.setHeaderColor?.(false ? '#0a0a09' : '#0f2b1f');
        tg.setBackgroundColor?.('#040303');
      }
    }
  }, []);

  return (
    <html lang="uz" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        `}</style>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#040303] text-[#fdfcfc] min-h-screen overflow-x-hidden`}>
        <LanguageProvider>
          <div className="tma-container min-h-screen flex flex-col">
            {/* Decorative top border */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[#d4a72c] via-[#8b5e3c] to-[#2d6a4f]" />
            <main className="flex-1 pb-20 pt-2 px-3">
              {children}
            </main>
            {/* Decorative bottom pattern */}
            <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none z-40"
              style={{
                background: 'linear-gradient(to top, rgba(4,3,3,0.95) 0%, transparent 100%)',
              }}
            />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
