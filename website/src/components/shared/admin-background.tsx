'use client';

import { useEffect, useState } from 'react';

// Admin panel orqa fon rasmi — settings'dan o'qiladi va live yangilanadi
export function AdminBackground() {
  const [bg, setBg] = useState<{ url: string; sidebar: string; glass: string; dim: string }>({
    url: '',
    sidebar: 'visible',
    glass: 'none',
    dim: 'none',
  });
  const [loaded, setLoaded] = useState(false);

  // Settings'dan fonni yuklash
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setBg({
            url: data.background_image || '',
            sidebar: data.admin_bg_show_sidebar === 'true' ? 'hidden' : 'visible',
            glass: data.admin_bg_show_glass === 'true' ? 'glass' : 'none',
            dim: data.admin_bg_show_dim === 'true' ? 'dim' : 'none',
          });
        }
      } catch (e) {
        console.error('Failed to load background:', e);
      } finally {
        setLoaded(true);
      }
    })();

    // Live yangilanish event'ini eshitish
    const onBgChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setBg({
          url: detail.url ?? '',
          sidebar: detail.sidebar ?? 'visible',
          glass: detail.glass ?? 'none',
          dim: detail.dim ?? 'none',
        });
      }
    };
    window.addEventListener('admin-bg-change', onBgChange);
    return () => window.removeEventListener('admin-bg-change', onBgChange);
  }, []);

  if (!loaded || !bg.url) {
    return null;
  }

  const sidebarHidden = bg.sidebar === 'hidden';

  return (
    <>
      {/* Orqa fon rasmi */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bg.url}
          alt=""
          className="w-full h-full object-cover"
          style={{
            opacity: 0.5,
            filter: bg.dim === 'dim' ? 'brightness(0.5)' : 'brightness(0.8)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(2,6,23,0.55) 0%, rgba(2,6,23,0.75) 50%, rgba(2,6,23,0.9) 100%)',
          }}
        />
      </div>

      {/* Sidebarni yashirish uchun CSS */}
      {sidebarHidden && (
        <style>{`
          @media (min-width: 1024px) {
            aside.${'admin-sidebar'} { display: none !important; }
          }
        `}</style>
      )}
    </>
  );
}
