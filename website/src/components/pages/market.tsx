'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Shield,
  Zap,
  MessageSquare,
  Bitcoin,
  Hexagon,
  Sun,
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';

const CRYPTO_INFO: {
  ticker: string;
  name: string;
  description: string;
  icon: typeof Bitcoin;
  color: string;
}[] = [
  {
    ticker: 'BTCUSDT',
    name: 'Bitcoin',
    description:
      "Bitcoin - dunyodagi eng yaxshi kripto valyuta. Digital oltin sifatida tanilgan.",
    icon: Bitcoin,
    color: '#f7931a',
  },
  {
    ticker: 'ETHUSDT',
    name: 'Ethereum',
    description:
      'Ethereum - smart kontraktar va dApps platformasi. DeFi ekotizimining asosi.',
    icon: Hexagon,
    color: '#627eea',
  },
  {
    ticker: 'SOLUSDT',
    name: 'Solana',
    description:
      'Solana - yuqori tezlikdagi blockchain. Arzon va tezkor tranzaksiyalar.',
    icon: Zap,
    color: '#00ffa3',
  },
  {
    ticker: 'GRAMUSDT',
    name: 'GRAM Token',
    description:
      'GRAM - Telegram ekotizimi tokeni. Tezkor to\'lovlar va blokcheyn texnologiyalari.',
    icon: MessageSquare,
    color: '#9b59b6',
  },
];

export default function MarketPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <BarChart3 className="w-4 h-4 text-silver" />
              <span className="text-sm text-muted-foreground">
                Real-time ma&apos;lumotlar
              </span>
            </div>
          </motion.div>

          <SectionHeading
            title="Market Analysis"
            subtitle="Real-time kripto bozor monitoringi"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>
            <span>Binance</span>
            <span>Asia/Tashkent</span>
          </motion.div>
        </div>
      </section>

      {/* Market Info Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection delay={0.1}>
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-silver" />
              Kripto Valyutalar Haqida
            </h3>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CRYPTO_INFO.map((crypto, i) => {
              const Icon = crypto.icon;
              return (
                <GlassCard key={crypto.ticker} index={i} hover>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${crypto.color}15`,
                          border: `1px solid ${crypto.color}30`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: crypto.color }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {crypto.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {crypto.ticker}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {crypto.description}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    Ogohlantirish
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ushbu ma&apos;lumotlar faqat ta&apos;lim va ma&apos;lumot
                    maqsadida. Investitsiya maslahati emas.
                  </p>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}