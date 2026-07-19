'use client';

import { motion } from 'framer-motion';
import {
  Crown,
  Zap,
  UserCheck,
  Lock,
  Users,
  Clock,
  Infinity,
  Send,
  Star,
  Quote,
  GraduationCap,
  Activity,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TelegramButtons } from '@/components/shared/telegram-buttons';
import { TELEGRAM } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Priority Signallar',
    description: 'VIP signallar birinchi bo\'lib yetkaziladi',
  },
  {
    icon: UserCheck,
    title: 'Shaxsiy Mentorlik',
    description: '1-on-1 mentoring sessiyalari',
  },
  {
    icon: Lock,
    title: 'Exclusive Analysis',
    description: 'Faqat VIP uchun market analysis',
  },
  {
    icon: Users,
    title: 'VIP Guruh',
    description: 'Eksklyuziv Telegram guruhi',
  },
  {
    icon: Clock,
    title: 'Early Access',
    description: 'Yangi funksiyalar va kurslarga erta kirish',
  },
  {
    icon: Infinity,
    title: 'Lifetime Access',
    description: 'Umrbod VIP kirish',
  },
];

const TESTIMONIALS = [
  {
    text: 'AAA kursi mening savdolarni to\'liq o\'zgartirdi. Professional approach va aniq signallar.',
    author: 'Savdogar A',
    role: 'Spot Trader',
  },
  {
    text: 'Risk management bo\'limi eng foydali bo\'ldi. Endi kapitalimni to\'g\'ri boshqaraman.',
    author: 'Savdogar B',
    role: 'Futures Trader',
  },
  {
    text: 'VIP hamjamiyat a\'zosiman va bu eng yaxshi investitsiya bo\'ldi.',
    author: 'Savdogar C',
    role: 'Portfolio Manager',
  },
];

export default function VipPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        {/* Decorative floating elements */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-32 right-[10%] size-16 rounded-full bg-silver/[0.03] border border-silver/10 hidden lg:block pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-48 left-[8%] size-10 rounded-lg bg-silver/[0.03] border border-silver/10 hidden lg:block pointer-events-none"
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-6">
              <Crown className="size-4 text-silver" />
              <span className="text-sm text-silver font-medium">
                Eksklyuziv
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gradient-silver mb-4">
              VIP
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground/90 mb-4">
              Eksklyuziv savdo hamjamiyati
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              VIP a&apos;zolik — professional savdogarlar uchun mo&apos;ljallangan
              eksklyuziv hamjamiyat. Priority signallar, shaxsiy mentorlik va
              maxsus market analysis bilan savdo tajribangizni yangi bosqichga
              olib chiqing.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* VIP Benefits Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="VIP afzalliklari"
            subtitle="VIP a'zolik bilan olingan imkoniyatlar"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {BENEFITS.map((benefit, i) => (
              <GlassCard key={benefit.title} index={i} hover>
                <div className="flex items-start gap-4">
                  <div className="size-11 rounded-xl bg-silver/10 border border-silver/15 flex items-center justify-center shrink-0">
                    <benefit.icon className="size-5 text-silver" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Tiers Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="VIP variantlari"
            subtitle="O'zingizga mos VIP paketni tanlang"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* VIP Course + Signals */}
            <GlassCard hover className="relative flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="size-5 text-silver" />
                  <Activity className="size-5 text-silver" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  VIP Course + Signals
                </h3>
                <p className="text-muted-foreground">
                  Kurs va signal birga
                </p>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {[
                  'To\'liq Trading Haqiqati kursi',
                  'AT_analysis signallari',
                  'VIP Telegram guruhi',
                  'Shaxsiy mentoring sessiyasi',
                  "Priority qo'llab-quvvatlash",
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="size-4 rounded-full bg-silver/10 flex items-center justify-center shrink-0">
                      <div className="size-1.5 rounded-full bg-silver" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground/70 mb-4">
                Telegram Bot orqali narxini biling
              </p>

              <Button
                asChild
                className="w-full bg-silver text-silver-foreground hover:bg-silver/90"
                size="lg"
              >
                <a
                  href={TELEGRAM.BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="size-4" />
                  Narxini bilish
                </a>
              </Button>
            </GlassCard>

            {/* VIP Lifetime */}
            <GlassCard hover glow className="relative flex flex-col">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-silver text-silver-foreground border-silver/30 text-xs font-semibold px-3 py-1">
                Lifetime
              </Badge>
              <div className="mb-6 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Infinity className="size-5 text-silver" />
                  <Crown className="size-5 text-silver" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  VIP Lifetime
                </h3>
                <p className="text-muted-foreground">
                  Umrbod VIP a&apos;zo
                </p>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {[
                  'Barcha VIP afzalliklari',
                  'Umrbod kirish huquqi',
                  'Barcha kelajak kurslar',
                  'Eksklyuziv analysis',
                  'Birinchi darajali qo\'llab-quvvatlash',
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="size-4 rounded-full bg-silver/10 flex items-center justify-center shrink-0">
                      <div className="size-1.5 rounded-full bg-silver" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground/70 mb-4">
                Batafsil ma&apos;lumot uchun bog&apos;laning
              </p>

              <Button
                asChild
                className="w-full glass-card hover:bg-silver/10 text-silver"
                size="lg"
              >
                <a
                  href={TELEGRAM.MARKETING_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="size-4" />
                  Bog&apos;lanish
                </a>
              </Button>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Fikrlar"
            subtitle="VIP a'zolarimizning tajribalari"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <GlassCard key={testimonial.author} index={i} hover>
                <Quote className="size-6 text-silver/30 mb-4" />
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-silver/10">
                  <div className="size-9 rounded-full bg-silver/10 border border-silver/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-silver">
                      {testimonial.author.charAt(
                        testimonial.author.indexOf(' ') + 1
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="size-3 text-silver fill-silver"
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Telegram CTA Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimatedSection>
            <div className="glass-card p-8 sm:p-12 bg-glow">
              <Crown className="size-10 text-silver mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient-silver mb-3">
                VIP ga qo&apos;shiling
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                VIP ga qo&apos;shilish uchun Telegram Botga murojaat qiling.
                Batafsil ma&apos;lumot va narxlar haqida bilib oling.
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