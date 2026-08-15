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
  Activity,
  GraduationCap,
} from 'lucide-react';
import Image from 'next/image';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TradingHeroDecor } from '@/components/shared/trading-decor';
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
  { value: '230+', label: "O'quvchilar" },
  { value: '5 yillik', label: 'Tajriba' },
  { value: '$1M+', label: 'Kapital boshqaruvi' },
  { value: '24/7', label: "Qo'llab-quvvatlash" },
];

const projects = [
  {
    title: 'AT_ANALYSIS',
    badge: '📊',
    icon: Activity,
    description:
      'AT_ANALYSIS — AAA loyihasi tarkibidagi trading tahlil va signal yo\'nalishi. Unda asosan Spot Trading imkoniyatlari, bozor tahlillari va savdo g\'oyalari taqdim etiladi. AT_ANALYSIS AAA ekotizimining amaliy trading yo\'nalishlaridan biridir.',
  },
  {
    title: '«Trading Haqiqati»',
    badge: '📚',
    icon: GraduationCap,
    description:
      '«Trading Haqiqati» — AAA loyihasining asosiy ta\'limiy yo\'nalishlaridan biri. Kursda tradingning real tomonlari, halol trading tamoyillari, Spot Trading, bozor psixologiyasi, texnik tahlil, risk boshqaruvi, strategiya va treyder intizomi kabi muhim mavzular yoritiladi.',
  },
  {
    title: 'KITLAR JAMOSI',
    badge: '👥',
    icon: Users,
    description:
      'KITLAR JAMOSI — AAA tarkibidagi treyderlar va o\'quvchilar hamjamiyati. Jamoada ishtirokchilar tajriba almashadi, bozorni tahlil qiladi va halol trading tamoyillari asosida o\'z bilim va ko\'nikmalarini rivojlantiradi.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4">
        <TradingHeroDecor variant="profile" className="-z-10" />

        <AnimatedSection className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient"
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

      {/* ── Asoschi (Founder) Section ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Avatar — asoschi rasmi */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-emerald/40 shadow-lg shadow-emerald/10"
                >
                  <Image
                    src="/founder.jpg"
                    alt={SITE.FOUNDER}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </motion.div>

                {/* Info */}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gradient-silver">
                    Abdulloh Abdukarimov
                  </h3>
                  <p className="mt-2 text-sm font-medium tracking-wider uppercase text-emerald">
                    AAA Asoschisi
                  </p>
                  <div className="mt-1 w-12 h-0.5 bg-gradient-to-r from-emerald/60 to-transparent mx-auto sm:mx-0" />
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Abdulloh Abdukarimov — 5 yillik trading tajribasiga ega
                    mutaxassis, AAA loyihasi asoschisi va O&apos;zbekistonda
                    halol trading, xususan Spot Trading yo&apos;nalishini
                    rivojlantirishga katta e&apos;tibor qaratib kelayotgan
                    treyder.
                  </p>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    U trading faoliyati davomida $1 milliondan ziyod kapital
                    boshqaruvi bilan ishlagan. Uning asosiy yo&apos;nalishi —
                    halol Spot Trading, bozor tahlili, risk boshqaruvi va
                    intizomli savdo.
                  </p>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Abdullohning asosiy maqsadi — O&apos;zbekistonda tradingga
                    halol, mas&apos;uliyatli va bilimga asoslangan yondashuvni
                    rivojlantirish. U tradingni shunchaki tez daromad topish
                    vositasi emas, balki bilim, mehnat, sabr, tahlil va
                    riskni to&apos;g&apos;ri boshqarish talab qiladigan soha
                    sifatida targ&apos;ib qiladi.
                  </p>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── AAA Loyihasi ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            title="AAA Loyihasi"
            subtitle="Halol trading, ta'lim, bozor tahlili va treyderlar hamjamiyatini birlashtiruvchi loyiha."
          />
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6 sm:p-8">
              <p className="text-muted-foreground leading-relaxed">
                AAA — Abdulloh Abdukarimov tomonidan asos solingan, halol
                trading, ta&apos;lim, bozor tahlili va treyderlar hamjamiyatini
                birlashtiruvchi loyiha. AAA&apos;ning asosiy yo&apos;nalishi —
                halol trading madaniyatini O&apos;zbekistonda rivojlantirish va
                Spot Trading asosida ongli treyderlarni shakllantirish.
              </p>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Loyiha Yo'nalishlari ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            title="Loyiha Yo'nalishlari"
            subtitle="AAA ekotizimining asosiy yo'nalishlari — signal, ta'lim va hamjamiyat."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, i) => {
              const Icon = project.icon;
              return (
                <GlassCard key={project.title} hover index={i} className="p-6 h-full">
                  <div className="w-12 h-12 rounded-lg bg-silver/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-silver" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    <span className="mr-2">{project.badge}</span>
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {project.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
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

      {/* ── 230+ O'quvchi ── */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6 sm:p-8 flex items-center gap-4 sm:gap-6">
              <span className="text-3xl sm:text-4xl shrink-0">🎓</span>
              <p className="text-muted-foreground leading-relaxed">
                AAA loyihasi orqali bugungi kungacha{' '}
                <span className="font-semibold text-foreground">230 dan ziyod o&apos;quvchi</span>{' '}
                trading bo&apos;yicha ta&apos;lim olib, amaliy rivojlanish
                yo&apos;lidan o&apos;tgan.
              </p>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Tagline ── */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <GlassCard glow className="p-8 sm:p-10 text-center">
              <p className="text-xl sm:text-2xl font-bold text-gradient leading-relaxed">
                AAA — Halol Trading. Haqiqiy Bilim. Professional Rivojlanish.
              </p>
            </GlassCard>
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