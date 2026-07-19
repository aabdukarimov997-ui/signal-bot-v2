'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageCircle,
  Send,
  AlertCircle,
  Loader2,
  GraduationCap,
  Activity,
  CreditCard,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { TELEGRAM } from '@/lib/constants';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

type FAQCategory = 'all' | 'course' | 'signal' | 'payment' | 'general';

const CATEGORY_TABS: {
  value: FAQCategory;
  label: string;
  icon: typeof Info;
}[] = [
  { value: 'all', label: 'Barchasi', icon: Info },
  { value: 'course', label: 'Kurs', icon: GraduationCap },
  { value: 'signal', label: 'Signal', icon: Activity },
  { value: 'payment', label: "To'lov", icon: CreditCard },
  { value: 'general', label: 'Umumiy', icon: HelpCircle },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');

  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/faq');
      if (!res.ok) {
        throw new Error("FAQ ma'lumotlarini yuklashda xatolik yuz berdi");
      }
      const data: FAQItem[] = await res.json();
      setFaqs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Noma'lum xatolik yuz berdi"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = useMemo(() => {
    if (activeCategory === 'all') return faqs;
    return faqs.filter((faq) => faq.category === activeCategory);
  }, [faqs, activeCategory]);

  const faqCounts = useMemo(() => {
    const counts: Record<string, number> = { all: faqs.length };
    for (const faq of faqs) {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    }
    return counts;
  }, [faqs]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <HelpCircle className="w-4 h-4 text-silver" />
              <span className="text-sm text-muted-foreground">
                Yordam markazi
              </span>
            </div>
          </motion.div>

          <SectionHeading
            title="Ko'p Beriladigan Savollar"
            subtitle="Tez-tez so'raladigan savollar va javoblar"
          />
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection delay={0.05}>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCategory === tab.value;
                const count = faqCounts[tab.value] || 0;

                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveCategory(tab.value)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-300 border
                      ${
                        isActive
                          ? 'glass-strong border-silver/20 text-foreground shadow-[0_0_20px_rgba(192,192,192,0.08)]'
                          : 'glass border-glass-border text-muted-foreground hover:text-foreground hover:border-silver/15'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`
                          text-xs px-1.5 py-0.5 rounded-md
                          ${
                            isActive
                              ? 'bg-silver/10 text-silver'
                              : 'bg-silver/5 text-muted-foreground'
                          }
                        `}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card rounded-xl p-5 animate-pulse"
                >
                  <div className="h-5 bg-silver/5 rounded-md w-3/4 mb-4" />
                  <div className="h-3 bg-silver/5 rounded-md w-full mb-2" />
                  <div className="h-3 bg-silver/5 rounded-md w-5/6" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <AnimatedSection>
              <GlassCard className="max-w-lg mx-auto text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Xatolik yuz berdi
                    </h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={fetchFaqs}
                    className="gap-2 border-silver/20 text-silver hover:text-foreground"
                  >
                    <Loader2 className="w-4 h-4" />
                    Qayta urinish
                  </Button>
                </div>
              </GlassCard>
            </AnimatedSection>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredFaqs.length === 0 && (
            <AnimatedSection>
              <GlassCard className="max-w-lg mx-auto text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-silver/5 border border-glass-border flex items-center justify-center">
                    <HelpCircle className="w-7 h-7 text-silver/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Hali savollar yo&apos;q
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Bu kategoriyada hali savollar mavjud emas.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          )}

          {/* FAQ Accordion */}
          {!isLoading && !error && filteredFaqs.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Accordion type="single" collapsible className="space-y-3">
                  {filteredFaqs.map((faq, i) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      <AccordionItem
                        value={faq.id}
                        className="glass-card rounded-xl px-5 sm:px-6 border-0 data-[state=open]:border-glow data-[state=open]:shadow-[0_0_30px_rgba(192,192,192,0.05)] transition-shadow duration-300"
                      >
                        <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-foreground hover:text-silver hover:no-underline py-5 [&[data-state=open]>svg]:text-silver">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow>
              <div className="flex flex-col items-center text-center gap-6 p-8 sm:p-10">
                <div className="w-14 h-14 rounded-2xl bg-silver/5 border border-glass-border flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-silver" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Yana savollaringiz bormi?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Telegram orqali biz bilan bog&apos;laning — tez va
                    qulay yordam beramiz
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={`https://t.me/${TELEGRAM.HELP.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-silver/20 text-silver hover:text-foreground hover:border-silver/30 min-w-[180px]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {TELEGRAM.HELP}
                    </Button>
                  </Link>
                  <Link
                    href={TELEGRAM.MARKETING_CHANNEL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="gap-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white min-w-[180px]"
                    >
                      <Send className="w-4 h-4" />
                      Kanalga o&apos;tish
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}