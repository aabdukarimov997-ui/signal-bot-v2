'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Clock,
  MessageCircle,
  TrendingUp,
  Check,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TelegramButtons } from '@/components/shared/telegram-buttons';
import { TELEGRAM } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SignalData {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  semiannualPrice: number;
  monthlyFeatures: string[];
  quarterlyFeatures: string[];
  semiannualFeatures: string[];
  isActive: boolean;
}

const STATS = [
  {
    label: 'Kunlik signallar',
    value: '3-5',
    icon: Activity,
    description: 'Har kuni sifatli signallar',
  },
  {
    label: 'Asosiy tangalar',
    value: 'BTC, ETH, SOL, GRAM',
    icon: BarChart3,
    description: 'Eng ishonchli assetlar',
  },
  {
    label: 'Aniqlik',
    value: 'High',
    icon: TrendingUp,
    description: 'Professional tahlil asosida',
  },
  {
    label: "Qo'llab-quvvatlash",
    value: '24/7',
    icon: Clock,
    description: "Doimiy yordam va maslahatlar",
  },
];

const STEPS = [
  {
    number: 1,
    title: "Telegram Botga o'ting",
    description:
      "AT_analysis botiga o'ting va ro'yxatdan o'ting. Bot sizga barcha kerakli ko'rsatmalarni beradi.",
  },
  {
    number: 2,
    title: 'Tarifni tanlang',
    description:
      "O'zingizga mos tarifni tanlang — 1 oylik, 3 oylik yoki 6 oylik variantlar mavjud.",
  },
  {
    number: 3,
    title: "To'lovni amalga oshiring",
    description:
      "Qulay to'lov usullaridan birini tanlang va to'lovni amalga oshiring.",
  },
  {
    number: 4,
    title: 'Signallarni qabul qiling',
    description:
      "To'lov tasdiqlangach, darhol signallarni qabul qila boshlaysiz. Har kuni yangi imkoniyatlar!",
  },
];

function formatPrice(price: number, months: number): string {
  if (price === 0) return '';
  const perMonth = price / months;
  return `$${price}`;
}

function PricingCard({
  title,
  price,
  features,
  months,
  badge,
  highlight,
  glow,
  allPricesZero,
}: {
  title: string;
  price: number;
  features: string[];
  months: number;
  badge?: string;
  highlight?: boolean;
  glow?: boolean;
  allPricesZero: boolean;
}) {
  return (
    <GlassCard
      hover
      className={`relative flex flex-col ${
        highlight
          ? 'border-silver/30 bg-silver/[0.03]'
          : ''
      }`}
      glow={glow}
    >
      {badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-silver text-silver-foreground border-silver/30 text-xs font-semibold px-3 py-1">
          {badge}
        </Badge>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          {allPricesZero ? (
            <span className="text-3xl font-bold text-silver">Bog'laning</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-silver">
                {formatPrice(price, months)}
              </span>
              {months > 1 && (
                <span className="text-sm text-muted-foreground">
                  / {months} oy
                </span>
              )}
            </>
          )}
        </div>
        {price > 0 && months > 1 && (
          <p className="mt-1 text-sm text-muted-foreground">
            ~${(price / months).toFixed(0)}/oy
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {(features.length > 0 ? features : defaultFeatures(months)).map(
          (feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2.5"
            >
              <Check className="size-4 text-silver mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </motion.div>
          )
        )}
      </div>

      <Button
        asChild
        className={
          highlight
            ? 'w-full bg-silver text-silver-foreground hover:bg-silver/90'
            : 'w-full glass-card hover:bg-silver/10 text-silver'
        }
        size="lg"
      >
        <a
          href={TELEGRAM.BOT}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Send className="size-4" />
          {allPricesZero ? "Botga yozing" : 'Sotib olish'}
        </a>
      </Button>
    </GlassCard>
  );
}

function defaultFeatures(months: number): string[] {
  const base = [
    "Kunlik kripto signallar",
    'Entry, Stop Loss, Take Profit',
    'BTC, ETH, SOL, GRAM signallari',
    "24/7 qo'llab-quvvatlash",
  ];
  if (months >= 3) {
    base.push('Haftalik market overview');
    base.push("Risk management maslahatlari");
  }
  if (months >= 6) {
    base.push('Shaxsiy maslahat sessiyasi');
    base.push("Priority signal kirish");
  }
  return base;
}

export default function SignalsPage() {
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignalData() {
      try {
        const res = await fetch('/api/signals');
        if (res.ok) {
          const data = await res.json();
          setSignalData(data);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchSignalData();
  }, []);

  const monthlyPrice = signalData?.monthlyPrice ?? 0;
  const quarterlyPrice = signalData?.quarterlyPrice ?? 0;
  const semiannualPrice = signalData?.semiannualPrice ?? 0;
  const allPricesZero =
    monthlyPrice === 0 && quarterlyPrice === 0 && semiannualPrice === 0;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-6">
              <Activity className="size-4 text-silver" />
              <span className="text-sm text-silver font-medium">
                Professional Signallar
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-4">
              AT_analysis
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground/90 mb-4">
              Professional kripto savdo signallari
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AT_analysis — professional texnik tahlil va chuqur bozor
              tadqiqotlari asosida tayyorlangan kripto savdo signallari. Har
              kuni aniqlangan kirish va chiqish nuqtalari bilan sifatli
              signallar oling.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Signal Stats Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat, i) => (
              <GlassCard key={stat.label} index={i} className="text-center">
                <div className="inline-flex items-center justify-center size-10 rounded-lg bg-silver/10 mb-3">
                  <stat.icon className="size-5 text-silver" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-sm sm:text-base font-bold text-foreground">
                  {stat.value}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Tariflar"
            subtitle="O'zingizga mos tarifni tanlang va professional signallarni qabul qiling"
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass-card p-6 animate-pulse-slow"
                >
                  <div className="h-6 bg-silver/10 rounded w-24 mb-4" />
                  <div className="h-10 bg-silver/10 rounded w-32 mb-6" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div
                        key={j}
                        className="h-4 bg-silver/10 rounded w-full"
                      />
                    ))}
                  </div>
                  <div className="h-10 bg-silver/10 rounded w-full mt-6" />
                </div>
              ))}
            </div>
          ) : allPricesZero ? (
            <AnimatedSection>
              <GlassCard className="max-w-lg mx-auto text-center py-12">
                <MessageCircle className="size-12 text-silver mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Narxlar tez orada e'lon qilinadi
                </h3>
                <p className="text-muted-foreground mb-6">
                  Hozircha tariflar belgilanmagan. Batafsil ma&apos;lumot va
                  narxlar uchun Telegram Botga murojaat qiling.
                </p>
                <Button
                  asChild
                  className="bg-silver text-silver-foreground hover:bg-silver/90"
                  size="lg"
                >
                  <a
                    href={TELEGRAM.BOT}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send className="size-4" />
                    Telegram Botga yozing
                  </a>
                </Button>
              </GlassCard>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <PricingCard
                title="1 Oylik"
                price={monthlyPrice}
                features={signalData?.monthlyFeatures ?? []}
                months={1}
                allPricesZero={false}
              />
              <PricingCard
                title="3 Oylik"
                price={quarterlyPrice}
                features={signalData?.quarterlyFeatures ?? []}
                months={3}
                badge="Eng mashhur"
                highlight
                allPricesZero={false}
              />
              <PricingCard
                title="6 Oylik"
                price={semiannualPrice}
                features={signalData?.semiannualFeatures ?? []}
                months={6}
                badge="Eng yaxshi qiymat"
                glow
                allPricesZero={false}
              />
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Qanday ishlaydi?"
            subtitle="4 ta oddiy bosqichda signallarni qabul qila boshlang"
          />

          <div className="relative">
            {/* Connecting line — desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-transparent via-silver/20 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {STEPS.map((step, i) => (
                <AnimatedSection key={step.number} delay={i * 0.15}>
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="size-12 rounded-full bg-silver/10 border border-silver/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-silver">
                          {step.number}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                      {step.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signal Preview Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <SectionHeading
            title="Signal namunasi"
            subtitle="Haqiqiy signal natijasi — Telegram kanalimizdan"
          />

          <AnimatedSection>
            {/* Telegram-style message bubble */}
            <div className="glass-card overflow-hidden">
              {/* Channel header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-silver/10 bg-silver/[0.03]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e0e0e0] via-[#c0c0c0] to-[#7c7b7b] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#040303] select-none">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Abdulloh trader (AAA)</p>
                  <p className="text-xs text-muted-foreground">@abdullohtreydr</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">12 Yanvar</span>
              </div>

              {/* Post image — chart screenshot */}
              <div className="relative">
                <img
                  src="/signal-example.jpg"
                  alt="BTC signal chart — Full TP natijasi"
                  className="w-full object-cover"
                  loading="lazy"
                />
                {/* Full TP badge overlay */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald/90 text-emerald-foreground text-xs font-bold backdrop-blur-sm shadow-lg">
                    <Check className="size-3.5" />
                    FULL TP
                  </span>
                </div>
              </div>

              {/* Post text */}
              <div className="px-4 py-4 space-y-3">
                {/* Description text matching the real Telegram post */}
                <p className="text-sm text-foreground/90 leading-relaxed">
                  $BTC full TP shuyerda yopamiz. Bozor tushganda kapitalni depolaringni minusga kirgizmaslik uchun bo&apos;lar bo&apos;mas signallar berilmadi. Aniq sabab va tasdiqdan keyin berildi va Allohni fazli bilan natijasini ko&apos;rip turipmiz.
                </p>

                {/* Signal levels */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-silver/[0.04]">
                    <span className="text-xs text-muted-foreground">Entry</span>
                    <span className="text-sm font-semibold text-foreground">$92,400</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5">
                    <span className="text-xs text-muted-foreground">Stop Loss</span>
                    <span className="text-sm font-semibold text-destructive">$90,800</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-emerald/5">
                    <span className="text-xs text-muted-foreground">Take Profit</span>
                    <span className="text-sm font-semibold text-emerald">✅ $97,500</span>
                  </div>
                </div>

                {/* Result */}
                <div className="flex items-center justify-between pt-2 border-t border-silver/10">
                  <span className="text-xs text-muted-foreground">Natija</span>
                  <span className="text-sm font-bold text-emerald">+5.52%</span>
                </div>
              </div>

              {/* Reactions / link */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-silver/10 bg-silver/[0.02]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="text-base">🔥</span>
                  <span className="text-xs">128</span>
                </div>
                <a
                  href="https://t.me/abdullohtreydr/5077"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-silver/60 hover:text-silver transition-colors"
                >
                  t.me/abdullohtreydr/5077 →
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="flex items-start gap-3 text-center justify-center">
              <AlertTriangle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed">
                Signallar faqat ma&apos;lumot maqsadida. Savdo xavflarga ega.
                Professional maslahat oling. Kelajakdagi natijalar kafolatlanmaydi.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Telegram CTA Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedSection>
            <div className="glass-card p-8 sm:p-12 bg-glow">
              <Send className="size-10 text-silver mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-3">
                Signallarni boshlang
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Hozir Telegram Botga murojaat qiling va professional
                signallarni qabul qila boshlang.
              </p>
              <div className="flex justify-center">
                <TelegramButtons variant="full" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}