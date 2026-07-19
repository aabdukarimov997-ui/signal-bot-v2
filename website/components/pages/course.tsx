'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  BookOpen,
  Users,
  MonitorSmartphone,
  Send,
} from 'lucide-react';
import { TELEGRAM } from '@/lib/constants';
import type { Course } from '@/lib/types';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TelegramButtons } from '@/components/shared/telegram-buttons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/* ──────────────── animation helpers ──────────────── */
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

/* ──────────────── course modules data ──────────────── */
const MODULES = [
  'Kripto bozori asoslari va tushunchalari',
  'Texnik analiz: trend chiziqlari, support/resistance',
  'Yapon shamdonlari (Candlestick) naqshlari',
  'Indikatorlar: RSI, MACD, Bollinger Bands, Moving Averages',
  'Volume analysis va buyurtma kitobi (Order Book)',
  'Risk Management va pozitsiya hajmi hisoblash',
  'Trading psixologiyasi va intizom',
  'Spot savdo strategiyalari',
  'Futures va leverage savdo asoslari',
  'Market turlari: Bull, Bear, Sideways',
  'Portfolio diversifikatsiyasi',
  'Amaliy savdo sessiyalari va uyga vazifalar',
] as const;

const TARGET_AUDIENCE = [
  'Kripto bozorida yangi boshlaganlar',
  'O\'z savdo ko\'nikmalarini yaxshilashni istaydiganlar',
  'Professional savdoga o\'tmoqchi bo\'lganlar',
  'Signallarni tushunish va mustaqil savdo qilishni xohlaydiganlar',
  'Moliyaviy erkinlikka erishmoqchi bo\'lganlar',
] as const;

const REQUIREMENTS = [
  'Telegram ilovasi o\'rnatilgan smartfon yoki kompyuter',
  'Kripto birja hisob varaqasi (Binance tavsiya etiladi)',
  'Har kuni kamida 1-2 soat vaqt ajratish tayyorgarligi',
  'O\'rganishga va amaliyot qilishga tayyorlik',
] as const;

/* ──────────────── pricing card sub-component ──────────────── */
interface PricingCardProps {
  tier: string;
  badge?: string;
  price: number;
  features: string[];
  glow?: boolean;
  highlightBorder?: boolean;
  index: number;
}

function PricingCard({
  tier,
  badge,
  price,
  features,
  glow = false,
  highlightBorder = false,
  index,
}: PricingCardProps) {
  const hasPrice = price > 0;

  return (
    <GlassCard
      hover
      glow={glow}
      index={index}
      className={cn(
        'relative flex flex-col p-6 sm:p-8',
        highlightBorder && 'border-silver/40'
      )}
    >
      {/* badge */}
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-silver text-silver-foreground px-4 py-1 text-xs font-semibold tracking-wide">
          {badge}
        </span>
      )}

      {/* tier name */}
      <h3 className="text-lg font-bold text-foreground">{tier}</h3>

      {/* price or placeholder */}
      <div className="mt-4 mb-6">
        {hasPrice ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-gradient">
              ${price}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Narxni bilish uchun Telegram Botga murojaat qiling
          </p>
        )}
      </div>

      {/* features list */}
      <ul className="flex-1 space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Check className="size-4 text-silver shrink-0 mt-0.5" />
            <span className="text-muted-foreground leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <a
        href={TELEGRAM.BOT}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
      >
        <Button
          size="lg"
          className={cn(
            'w-full rounded-xl text-sm font-semibold',
            glow
              ? 'bg-silver text-silver-foreground hover:bg-silver/90'
              : 'border border-glass-border text-silver hover:text-white hover:bg-white/5'
          )}
          variant={glow ? 'default' : 'outline'}
        >
          {hasPrice ? 'Sotib olish' : "Botga murojaat qiling"}
          <ArrowRight className="size-4 ml-1.5" />
        </Button>
      </a>
    </GlassCard>
  );
}

/* ──────────────── main component ──────────────── */
export default function CoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('fetch failed');
        const data: Course = await res.json();
        if (!cancelled) {
          setCourse(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const starterFeatures: string[] = Array.isArray(course?.starterFeatures)
    ? (course.starterFeatures as unknown as string[])
    : [];
  const professionalFeatures: string[] = Array.isArray(course?.professionalFeatures)
    ? (course.professionalFeatures as unknown as string[])
    : [];
  const masterFeatures: string[] = Array.isArray(course?.masterFeatures)
    ? (course.masterFeatures as unknown as string[])
    : [];

  /* ────────── HERO ────────── */
  const hero = (
    <section className="relative px-4 pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(192,192,192,0.05) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-3xl flex flex-col items-center text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gradient"
        >
          Trading Haqiqati
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-3 text-lg sm:text-xl text-muted-foreground"
        >
          Professional kripto savdo kursi
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed"
        >
          {loading ? (
            <Skeleton className="h-16 w-full max-w-2xl rounded-xl" />
          ) : course?.description ? (
            course.description
          ) : (
            'Trading Haqiqati — bu kripto bozorida professional savdo qilishni o\'rgatuvchi eng yaxshi kurs. Nazariy bilimlar, amaliy mashg\'ulotlar va real savdo strategiyalari bilan to\'la.'
          )}
        </motion.p>
      </motion.div>
    </section>
  );

  /* ────────── PRICING ────────── */
  const pricing = (
    <section className="relative px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Narxlar"
          subtitle="O'zingizga mos rejangni tanlang"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass-card p-6 sm:p-8 space-y-4">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-12 w-20 rounded-md" />
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-4 w-full rounded-md" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
            <PricingCard
              tier="Starter"
              price={course?.starterPrice ?? 0}
              features={
                starterFeatures.length > 0
                  ? starterFeatures
                  : [
                      'Kurs materiallariiga kirish',
                      'Telegram guruhida o\'qish',
                      'Asosiy texnik analiz',
                      '1 oy qo\'llab-quvvatlash',
                    ]
              }
              index={0}
            />
            <PricingCard
              tier="Professional"
              badge="Mashhur"
              price={course?.professionalPrice ?? 0}
              features={
                professionalFeatures.length > 0
                  ? professionalFeatures
                  : [
                      'Barcha Starter xususiyatlari',
                      'Kunlik savdo signallari',
                      'Individual konsultatsiya',
                      'Risk management moduli',
                      'VIP guruhga kirish',
                      '3 oy qo\'llab-quvvatlash',
                    ]
              }
              highlightBorder
              index={1}
            />
            <PricingCard
              tier="Master"
              badge="Premium"
              price={course?.masterPrice ?? 0}
              features={
                masterFeatures.length > 0
                  ? masterFeatures
                  : [
                      'Barcha Professional xususiyatlari',
                      '1-on-1 mentoring sessiyalari',
                      'Eksklyuziv savdo strategiyalari',
                      'Lifetime kirish',
                      'Shaxsiy portfolio tahlili',
                      'Priority qo\'llab-quvvatlash',
                      'Sertifikat',
                    ]
              }
              glow
              index={2}
            />
          </div>
        )}
      </div>
    </section>
  );

  /* ────────── COURSE DETAILS ────────── */
  const details = (
    <section className="relative px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* What you'll learn */}
        <AnimatedSection>
          <GlassCard className="p-6 sm:p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] border border-glass-border">
                <BookOpen className="size-5 text-silver" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Nimalarni O&apos;rganasiz?
              </h3>
            </div>

            <ul className="space-y-3">
              {MODULES.map((mod, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-xs text-silver font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-snug">{mod}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </AnimatedSection>

        {/* Right column: Who + Requirements */}
        <div className="flex flex-col gap-8">
          {/* Who is this for */}
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] border border-glass-border">
                  <Users className="size-5 text-silver" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Bu Kurs Kimlar Uchun?
                </h3>
              </div>

              <ul className="space-y-3">
                {TARGET_AUDIENCE.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-silver shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </AnimatedSection>

          {/* Requirements */}
          <AnimatedSection delay={0.2}>
            <GlassCard className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] border border-glass-border">
                  <MonitorSmartphone className="size-5 text-silver" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Talablar</h3>
              </div>

              <ul className="space-y-3">
                {REQUIREMENTS.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 text-silver shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug">{req}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );

  /* ────────── TELEGRAM CTA ────────── */
  const telegramCta = (
    <section className="relative px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection>
          <GlassCard glow className="relative overflow-hidden p-8 sm:p-12 flex flex-col items-center text-center gap-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(192,192,192,0.04) 0%, transparent 60%)',
              }}
            />
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-glass-border">
              <Send className="size-7 text-silver" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gradient">
              Kursni sotib olish uchun Telegram Botga murojaat qiling
            </h2>
            <p className="max-w-lg text-muted-foreground text-sm sm:text-base leading-relaxed">
              Bot orqali kursni sotib oling, to&apos;lov qiling va darhol
              barcha materiallarga kirish oling. Tez va qulay!
            </p>
            <TelegramButtons variant="full" />
          </GlassCard>
        </AnimatedSection>
      </div>
    </section>
  );

  /* ────────── PAGE ────────── */
  return (
    <main className="flex flex-col">
      {hero}
      {pricing}
      {details}
      {telegramCta}
    </main>
  );
}