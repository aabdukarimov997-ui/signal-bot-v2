'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Activity,
  Shield,
  Crown,
  Headphones,
  BarChart3,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigationStore } from '@/store';
import { TELEGRAM, SITE } from '@/lib/constants';
import type { Banner } from '@/lib/types';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TelegramButtons } from '@/components/shared/telegram-buttons';
import { Logo } from '@/components/shared/logo';
import { MarketTicker } from '@/components/shared/market-ticker';
import { TradingBg } from '@/components/shared/trading-bg';
import { FearGreedIndex } from '@/components/shared/fear-greed';
import { MarketPulse } from '@/components/shared/market-pulse';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ──────────────── stagger children container ──────────────── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/* ──────────────── features data ──────────────── */
const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Professional Ta\'lim',
    desc: 'Trading Haqiqati kursi orqali bozorni chuqur tushunib oling',
  },
  {
    icon: Activity,
    title: 'Aniq Signallar',
    desc: 'Kunlik 3-5 ta aniq savdo signallari bilan savdo qiling',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    desc: 'Professional risk boshqarish strategiyalarini o\'rganing',
  },
  {
    icon: Crown,
    title: 'VIP Hamjamiyat',
    desc: 'Eksklyuziv savdogarlar hamjamiyatiga qo\'shiling',
  },
  {
    icon: Headphones,
    title: '24/7 Qo\'llab-quvvatlash',
    desc: 'Telegram orqali doimiy yordam oling',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analysis',
    desc: 'Kunlik market analysis va sharhlar',
  },
] as const;

const STATS = [
  { value: '230+', label: 'O\'quvchilar' },
  { value: '5 yillik', label: 'Tajriba' },
  { value: '5000+', label: 'Signallar' },
] as const;

/* ──────────────── component ──────────────── */
export default function HomePage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannersReady, setBannersReady] = useState(false);

  /* force-start the hero bull/bear animations after mount (some browsers
     defer CSS animation start-times; this guarantees they run) */
  useEffect(() => {
    document.querySelectorAll('.animate-bull, .animate-bear').forEach((el) => {
      el.getAnimations().forEach((a) => {
        a.cancel();
        a.play();
      });
    });
  }, []);

  /* fetch banners */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/banners');
        if (!res.ok) throw new Error('fetch failed');
        const data: Banner[] = await res.json();
        if (!cancelled) {
          setBanners(data);
          setBannersReady(true);
        }
      } catch {
        if (!cancelled) setBannersReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* auto-rotate carousel */
  const next = useCallback(() => {
    const max = banners.length > 0 ? banners.length - 1 : 0;
    setActiveBanner((p) => (p >= max ? 0 : p + 1));
  }, [banners.length]);
  const prev = useCallback(() => {
    const max = banners.length > 0 ? banners.length - 1 : 0;
    setActiveBanner((p) => (p <= 0 ? max : p - 1));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [banners.length, next]);

  /* ────────── HERO ────────── */
  const hero = (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* live market ticker */}
      <MarketTicker />

      {/* animated candlestick canvas background */}
      <TradingBg className="opacity-70" />

      {/* aurora orbs */}
      <div
        aria-hidden
        className="glow-orb -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 bg-emerald/12"
      />
      <div
        aria-hidden
        className="glow-orb -bottom-40 -left-24 h-[380px] w-[380px] bg-gold/8"
      />
      <div
        aria-hidden
        className="glow-orb -right-32 top-1/3 h-[360px] w-[360px] bg-[#3ec9f5]/8"
      />

      {/* live bull & bear silhouettes (bull market vs bear market) */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-0 animate-bull">
        <img
          src="/bull-silhouette.svg"
          alt=""
          className="h-[36vh] w-auto max-h-[420px] select-none opacity-[0.24] sm:h-[44vh] lg:h-[50vh]"
          style={{
            transform: 'scaleX(-1)',
            maskImage:
              'linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.3) 65%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.3) 65%, transparent 100%)',
          }}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 z-0 animate-bear">
        <img
          src="/bear-silhouette.svg"
          alt=""
          className="h-[42vh] w-auto max-h-[480px] select-none opacity-[0.2] sm:h-[52vh] lg:h-[58vh]"
          style={{
            maskImage:
              'linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.3) 65%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to top, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.3) 65%, transparent 100%)',
          }}
        />
      </div>

      {/* floating stat cards (desktop) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute right-[6%] top-[30%] z-10 hidden xl:block"
      >
        <div className="glass-card animate-float rounded-2xl px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Signal Win Rate
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-gradient-emerald">
            94%
          </p>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.05, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute left-[6%] top-[46%] z-10 hidden xl:block"
      >
        <div className="glass-card animate-float-slow rounded-2xl px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Kunlik Signallar
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-gradient-gold">
            3–5
          </p>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute bottom-[22%] right-[12%] z-10 hidden xl:block"
      >
        <div className="glass-card animate-float rounded-2xl px-5 py-4" style={{ animationDelay: '1.5s' }}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Bozor Tajribasi
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-gradient-silver">
            5+ yil
          </p>
        </div>
      </motion.div>

      {/* centered hero content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex max-w-4xl flex-col items-center text-center mx-auto"
        >
          {/* large logo with background */}
          <motion.div variants={fadeUp} className="mb-6">
            <Logo size="hero" showBackground />
          </motion.div>

          {/* tagline */}
          <motion.span
            variants={fadeUp}
            className="mb-4 inline-block rounded-full border border-emerald/25 px-4 py-1.5 text-xs tracking-widest text-emerald/90 uppercase glass-emerald"
          >
            {SITE.TAGLINE}
          </motion.span>

          {/* heading */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tight"
          >
            <span className="text-gradient">Professional Crypto</span>
            <br />
            <span className="text-gradient">Trading Academy</span>
          </motion.h1>

          {/* description */}
          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            AAA Crypto Trading Academy — kripto valyuta bozorida professional
            savdo qilishni o&apos;rganish uchun eng yaxshi platforma. Nazariy
            bilimlar, amaliy mashg&apos;ulotlar, aniq signallar va faol
            hamjamiyat bilan muvaffaqiyatga erishish osonroq.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              onClick={() => navigate('course')}
              className="group rounded-xl px-7 text-sm font-semibold bg-emerald text-emerald-foreground shadow-[0_0_28px_var(--accent-glow-25)] hover:bg-emerald/90 hover:shadow-[0_0_40px_var(--accent-glow-40)]"
            >
              Trading Haqiqati
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <a
              href={TELEGRAM.BOT}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-7 text-sm font-semibold border-glass-border text-silver hover:text-foreground hover:bg-muted/40"
              >
                Telegram Bot
              </Button>
            </a>

            <a
              href={TELEGRAM.MARKETING_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="ghost"
                className="rounded-xl px-6 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Kanalga Qo&apos;shiling
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );

  /* ────────── FEATURES ────────── */
  const features = (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Nima Uchun AAA?"
          subtitle="Professional ta'lim, ishonchli signallar, premium hamjamiyat"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <GlassCard key={f.title} hover index={i} className="p-6 flex flex-col gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald/10 border border-emerald/15">
                  <Icon className="size-6 text-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );

  /* ────────── STATS ────────── */
  const stats = (
    <section className="relative px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <AnimatedSection>
          <div className="glass-card p-8 sm:p-10 border-glow-emerald">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 text-center">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-gradient">
                    {s.value}
                  </span>
                  <span className="text-sm text-muted-foreground tracking-wide uppercase">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* jonli bozor kayfiyati */}
            <div className="mt-8 border-t border-glass-border pt-6 flex flex-col gap-5">
              <FearGreedIndex compact />
              <div className="border-t border-glass-border pt-5">
                <MarketPulse compact />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );

  /* ────────── BANNERS CAROUSEL ────────── */
  const bannerSection = (
    <section className="relative px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <AnimatePresence mode="wait">
          {bannersReady && banners.length === 0 ? (
            /* default CTA banner */
            <motion.div
              key="default-banner"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45 }}
            >
              <GlassCard glow className="relative overflow-hidden p-8 sm:p-12 flex flex-col items-center text-center gap-6">
                {/* decorative glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10"
                  style={{
                    background:
                      'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(46,230,168,0.07) 0%, transparent 70%)',
                  }}
                />
                <h3 className="text-2xl sm:text-3xl font-bold text-gradient">
                  Trading Haqiqati kursini boshlang
                </h3>
                <p className="max-w-lg text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Professional kripto savdo kursi bilan bozorni chuqur
                  tushunib oling va ishonchli savdo qiling.
                </p>
                <a href={TELEGRAM.BOT} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 text-sm font-semibold bg-emerald text-emerald-foreground hover:bg-emerald/90"
                  >
                    Telegram Bot orqali boshlang
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </a>
              </GlassCard>
            </motion.div>
          ) : banners.length > 0 ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* slides */}
              <div className="relative overflow-hidden rounded-xl glass-card border-glow min-h-[240px] sm:min-h-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBanner}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative p-8 sm:p-12 flex flex-col items-center text-center gap-4"
                  >
                    {banners[activeBanner]?.imageUrl && (
                      <img
                        src={banners[activeBanner].imageUrl}
                        alt={banners[activeBanner].title}
                        className="absolute inset-0 w-full h-full object-cover rounded-xl -z-10 opacity-30"
                      />
                    )}
                    <h3 className="text-2xl sm:text-3xl font-bold text-gradient relative z-10">
                      {banners[activeBanner]?.title}
                    </h3>
                    {banners[activeBanner]?.subtitle && (
                      <p className="text-muted-foreground text-sm sm:text-base max-w-lg relative z-10">
                        {banners[activeBanner].subtitle}
                      </p>
                    )}
                    {banners[activeBanner]?.link && (
                      <a
                        href={banners[activeBanner].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10"
                      >
                        <Button
                          size="lg"
                          className="rounded-xl px-8 text-sm font-semibold bg-emerald text-emerald-foreground hover:bg-emerald/90"
                        >
                          Batafsil
                          <ArrowRight className="size-4 ml-1.5" />
                        </Button>
                      </a>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* nav arrows + dots */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Oldingi banner"
                  className="glass-card flex size-9 items-center justify-center text-muted-foreground hover:text-silver transition-colors rounded-lg"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <div className="flex items-center gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveBanner(i)}
                      aria-label={`Banner ${i + 1}`}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        i === activeBanner
                          ? 'w-6 bg-silver'
                          : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Keyingi banner"
                  className="glass-card flex size-9 items-center justify-center text-muted-foreground hover:text-silver transition-colors rounded-lg"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* loading skeleton */
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card h-[240px] sm:h-[280px] animate-pulse-slow"
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );

  /* ────────── TELEGRAM CTA ────────── */
  const telegramCta = (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection>
          <GlassCard glow className="relative overflow-hidden p-8 sm:p-12 flex flex-col items-center text-center gap-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(46,230,168,0.05) 0%, transparent 60%)',
              }}
            />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
              Telegram Kanalga Qo&apos;shiling
            </h2>
            <p className="max-w-xl text-muted-foreground text-sm sm:text-base leading-relaxed">
              Bizning marketing kanalimizda eng so&apos;nggi yangiliklar,
              market analysis, bepul ta&apos;lim materiallari va eksklyuziv
              takliflarni topasiz. Har kuni yangi kontent!
            </p>
            <TelegramButtons variant="full" />
            <p className="text-xs text-muted-foreground mt-2">
              Yordam kerakmi?{' '}
              <a
                href={`https://t.me/${TELEGRAM.HELP.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald hover:underline underline-offset-2"
              >
                {TELEGRAM.HELP}
              </a>
            </p>
          </GlassCard>
        </AnimatedSection>
      </div>
    </section>
  );



  /* ────────── PAGE ────────── */
  return (
    <main className="flex flex-col">
      {hero}
      {features}
      {stats}
      {bannerSection}
      {telegramCta}
    </main>
  );
}