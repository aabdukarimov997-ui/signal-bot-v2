'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  Award,
  Users,
  BookOpen,
  Heart,
  Send,
  UserPlus,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TELEGRAM, SITE } from '@/lib/constants';

const missions = [
  {
    title: 'Professional Ta\'lim',
    description:
      'Har bir savdogar professional savdo ko\'nikmalariga ega bo\'lishi kerak. Biz bu yo\'lda yordam beramiz.',
    icon: BookOpen,
  },
  {
    title: 'Ishonchli Signallar',
    description:
      'Sifatli va tekshirilgan signallar bilan savdogarlarga ishonchli yordam taqdim etamiz.',
    icon: Shield,
  },
  {
    title: 'Hamjamiyat',
    description:
      'Kuchli va qo\'llab-quvvatlovchi savdogarlar hamjamiyati yaratish.',
    icon: Users,
  },
];

const values = [
  { label: 'Intizom', icon: Shield },
  { label: 'Shaffoflik', icon: Eye },
  { label: 'Professionalizm', icon: Award },
  { label: 'Hamjamiyat', icon: Users },
  { label: 'Ta\'lim', icon: BookOpen },
  { label: 'Ishonch', icon: Heart },
];

const stats = [
  { value: '250+', label: "O'quvchilar" },
  { value: '5 yillik', label: 'Tajriba' },
  { value: '5000+', label: 'Signallar' },
  { value: '24/7', label: "Qo'llab-quvvatlash" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(192,192,192,0.04)_0%,transparent_70%)]" />
        </div>

        <AnimatedSection className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient"
          >
            Biz Haqimizda
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {SITE.NAME} Crypto Trading Academy —{' '}
            <span className="text-foreground/90 font-medium">{SITE.FOUNDER}</span>{' '}
            tomonidan asos solingan premium kripto savdo ta\'lim platformasi.
          </motion.p>
        </AnimatedSection>
      </section>

      {/* ── Founder Section ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#e0e0e0] via-[#c0c0c0] to-[#7c7b7b] flex items-center justify-center shadow-lg shadow-silver/10"
                >
                  <span className="text-4xl sm:text-5xl font-bold text-[#040303] select-none">
                    A
                  </span>
                </motion.div>

                {/* Info */}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gradient-silver">
                    {SITE.FOUNDER}
                  </h3>
                  <p className="mt-2 text-sm font-medium tracking-wider uppercase text-silver/70">
                    5 yillik Mutaxassis &amp; Spot Treyder
                  </p>
                  <div className="mt-1 w-12 h-0.5 bg-gradient-to-r from-silver/60 to-transparent mx-auto sm:mx-0" />
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Kripto savdo bo&apos;yicha 5 yillik tajriba va mutaxassislik.
                    Spot treyding va professional ta&apos;lim orqali savdogarlarga
                    yordam berish missiyasi. Trading Haqiqati kursi va AT_analysis
                    signal xizmati asoschisi. 250 dan ortiq o&apos;quvchiga
                    sifatli ta&apos;lim bergan.
                  </p>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Bizning Missiyamiz"
            subtitle="Savdogarlarga eng yaxshi ta'lim va xizmatlarni taqdim etish — bizning asosiy maqsadimiz."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missions.map((mission, i) => {
              const Icon = mission.icon;
              return (
                <GlassCard key={mission.title} hover index={i} className="p-6 h-full">
                  <div className="w-12 h-12 rounded-lg bg-silver/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-silver" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {mission.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {mission.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="Bizning Qadriyatlarimiz"
            subtitle="Bizning ishimizning asosi — quyidagi qadriyatlardir."
          />

          <GlassCard className="p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-glass hover:bg-glass-strong transition-colors duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-silver/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-silver" />
                    </div>
                    <span className="text-sm font-medium text-foreground/90">
                      {value.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, i) => (
                <GlassCard key={stat.label} index={i} className="p-6 text-center">
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 + i * 0.1,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="text-3xl sm:text-4xl font-bold text-gradient-silver"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Telegram CTA ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-8 sm:p-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-gradient mb-4">
                  Bizga Qo&apos;shiling!
                </h3>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                  Eng so&apos;nggi yangiliklar, signallar va ta&apos;lim materiallari
                  uchun Telegram kanalimizga obuna bo&apos;ling.
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href={TELEGRAM.MARKETING_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Telegram Kanal
                </motion.a>

                <motion.a
                  href={TELEGRAM.BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 h-11 px-6 rounded-lg border border-silver/20 bg-glass text-foreground font-medium text-sm hover:bg-glass-strong transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-silver" />
                  Bot orqali Boshlash
                </motion.a>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
    </main>
  );
}