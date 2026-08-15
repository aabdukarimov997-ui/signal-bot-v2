'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Calendar, Eye, Loader2, Youtube } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TradingHeroDecor } from '@/components/shared/trading-decor';
import { SOCIAL } from '@/lib/constants';

interface Video {
  id: string;
  title: string;
  published: string;
  views: number;
  thumbnail: string;
}

function formatDate(iso: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatViews(n: number) {
  if (!n) return '';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)} mln`;
  if (n >= 1000) return `${Math.round(n / 1000)} ming`;
  return `${n}`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/videos');
        const data = await res.json();
        if (Array.isArray(data.videos)) setVideos(data.videos);
        else throw new Error('No videos');
      } catch {
        setError("Videolarni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Esc tugmasi bilan modalni yopish */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4">
        <TradingHeroDecor variant="paper" className="-z-10" />

        <AnimatedSection className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient"
          >
            Videolar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Darslar, tahlillar va podcast&apos;lar —{' '}
            <a
              href={SOCIAL.YOUTUBE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#ff0000] hover:underline"
            >
              <Youtube className="size-5" />
              YouTube kanalimiz
            </a>
          </motion.p>
        </AnimatedSection>
      </section>

      {/* ── Videolar ── */}
      <section className="py-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="So'nggi videolar"
            subtitle="Eng so'nggi darslar va bozor tahlillarini shu yerda tomosha qiling — saytdan chiqmasdan."
          />

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald" />
            </div>
          )}

          {error && !loading && (
            <GlassCard className="p-10 text-center">
              <p className="text-muted-foreground">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground/70">
                YouTube kanaliga o&apos;ting:{' '}
                <a
                  href={SOCIAL.YOUTUBE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff0000] hover:underline"
                >
                  {SOCIAL.YOUTUBE}
                </a>
              </p>
            </GlassCard>
          )}

          {!loading && !error && videos.length === 0 && (
            <GlassCard className="p-10 text-center">
              <p className="text-muted-foreground">Hozircha videolar yo&apos;q</p>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <AnimatedSection key={video.id} delay={i * 0.05}>
                <button
                  type="button"
                  onClick={() => setActive(video)}
                  className="group block w-full text-left focus:outline-none"
                  aria-label={`Tomosha qilish: ${video.title}`}
                >
                  <GlassCard hover className="p-0 overflow-hidden h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex size-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 transition-transform duration-300 group-hover:scale-110">
                          <Play className="size-6 fill-current ml-0.5" />
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-emerald transition-colors">
                        {video.title}
                      </h3>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        {formatDate(video.published) && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            {formatDate(video.published)}
                          </span>
                        )}
                        {video.views > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="size-3.5" />
                            {formatViews(video.views)}
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Player modal ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1">
                  {active.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="shrink-0 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Yopish"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                <iframe
                  key={active.id}
                  src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
