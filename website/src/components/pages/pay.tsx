'use client';

import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigationStore } from '@/store';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { GeometricPattern, CornerOrnament } from '@/components/shared/oriental-pattern';
import PaymentModal from '@/components/shared/payment-modal';

/**
 * #pay — alohida to'lov sahifasi.
 * URL orqali ochiladi: /#pay (signal) yoki /#pay/course (kurs).
 * Sahifa ichida PaymentModal avtomatik ochiq holatda turadi.
 */
export default function PayPage() {
  const { payProductType, navigate, previousPage } = useNavigationStore();

  const isCourse = payProductType === 'course';

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-10 px-4 sm:px-6 overflow-hidden">
        <GeometricPattern opacity={0.07} className="-z-[2]" />
        <CornerOrnament position="top-left" className="z-10" />
        <CornerOrnament position="top-right" className="z-10" />
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-6">
              <CreditCard className="size-4 text-gold" />
              <span className="text-sm text-gold font-medium">
                {isCourse ? 'Kursga obuna' : 'Signalga obuna'}
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient mb-4">
              {isCourse ? '📚 Trading Haqiqati' : '📈 AT_analysis'}
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tarifni tanlang va to'lovni amalga oshiring. To'lov
              tasdiqlangach, obunangiz faollashtiriladi va sizga Telegram
              orqali xabar keladi.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Payment Modal (avtomatik ochiq) */}
      <PaymentModal
        open
        onOpenChange={(open) => {
          if (!open) {
            navigate(previousPage || (isCourse ? 'course' : 'signals'));
          }
        }}
        productType={payProductType}
      />

      {/* Info section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            title="To'lov jarayoni"
            subtitle="Qanday ishlaydi?"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: '🛒',
                title: 'Tarifni tanlang',
                desc: isCourse
                  ? 'Kurs paketlaridan birini tanlang'
                  : 'Signal tariflaridan birini tanlang',
              },
              {
                icon: '💳',
                title: "To'lov qiling",
                desc: "Karta yoki kripto orqali to'lov qiling va skrinshot yuklang",
              },
              {
                icon: '✅',
                title: 'Tasdiqlansin',
                desc: "Admin tasdiqlagach, obuna faollashadi va Telegram xabar keladi",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="text-center h-full">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <AnimatedSection delay={0.2}>
            <div className="flex items-center justify-center gap-2 mt-10 text-xs text-muted-foreground/70">
              <ShieldCheck className="size-4 text-emerald" />
              Barcha to'lovlar admin tomonidan tekshiriladi va xavfsiz
              amalga oshiriladi
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
