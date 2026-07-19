'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Activity,
  CreditCard,
  Share2,
  ExternalLink,
  Crown,
  Send,
  MessageSquare,
  Clock,
  Mail,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { useNavigationStore, useAuthStore } from '@/store';
import { TELEGRAM } from '@/lib/constants';
import { Button } from '@/components/ui/button';

/* ────────────────────────────────────────────
   Copy button (extracted to avoid re-mounts)
   ──────────────────────────────────────────── */
function CopyButton({ code }: { code: string }) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      toast.success('Kod nusxalandi!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Nusxalashda xatolik');
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-glass border border-glass-border text-xs text-muted-foreground hover:text-foreground hover:bg-glass-strong transition-colors duration-200"
      aria-label="Kodni nusxalash"
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          Nusxalandi
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Nusxalash
        </>
      )}
    </button>
  );
}

/* ────────────────────────────────────────────
   Static data
   ──────────────────────────────────────────── */
const dashboardStats = [
  {
    key: 'courses',
    label: 'Kurslar',
    value: '1',
    sublabel: 'Sotib olingan',
    icon: GraduationCap,
  },
  {
    key: 'signals',
    label: 'Signal',
    value: '—',
    sublabel: 'Faol obuna',
    icon: Activity,
  },
  {
    key: 'payments',
    label: "To'lovlar",
    value: '0',
    sublabel: 'Jami',
    icon: CreditCard,
  },
  {
    key: 'referrals',
    label: 'Referral',
    value: '0',
    sublabel: 'Takliflar',
    icon: Share2,
  },
];

const quickActions = [
  {
    label: "Kursni Ko'rish",
    icon: GraduationCap,
    page: 'course' as const,
    variant: 'default' as const,
  },
  {
    label: "Signallarni Ko'rish",
    icon: Activity,
    page: 'signals' as const,
    variant: 'outline' as const,
  },
  {
    label: 'Admin Panel',
    icon: Crown,
    page: 'admin-users' as const,
    variant: 'outline' as const,
    adminOnly: true,
  },
];

/* ────────────────────────────────────────────
   Dashboard page
   ──────────────────────────────────────────── */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigationStore((s) => s.navigate);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('login');
    }
  }, [user, navigate]);

  const referralCode = useMemo(() => {
    if (!user) return '—';
    const base = user.email.split('@')[0] ?? 'user';
    return base.toUpperCase().slice(0, 8);
  }, [user]);

  // Don't render anything while redirecting
  if (!user) return null;

  const filteredActions = quickActions.filter(
    (action) => !action.adminOnly || user.role === 'ADMIN'
  );

  return (
    <main className="min-h-screen pb-16">
      {/* ── Welcome Section ── */}
      <section className="pt-28 sm:pt-32 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient">
                Xush kelibsiz, {user.name}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Shaxsiy kabinetingizga xush kelibsiz
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── User Info Card ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e0e0e0] via-[#c0c0c0] to-[#7c7b7b] flex items-center justify-center">
                  <span className="text-lg font-bold text-[#040303] select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-foreground truncate">
                      {user.name}
                    </h2>
                    {user.role === 'ADMIN' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-silver/15 text-silver text-[11px] font-medium uppercase tracking-wider">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-silver/50" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-silver/50" />
                      2024-yil
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Dashboard Stats ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={stat.key} index={i} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-silver/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-silver" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gradient-silver">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground/70">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.sublabel}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Tezkor Harakatlar
              </h3>
              <div className="flex flex-wrap gap-3">
                {filteredActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * i }}
                    >
                      <Button
                        variant={action.variant}
                        onClick={() => navigate(action.page)}
                        className={
                          action.adminOnly
                            ? 'h-10 px-4 text-sm bg-silver/15 border-silver/20 text-silver hover:bg-silver/25 hover:text-silver'
                            : 'h-10 px-4 text-sm'
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {action.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                So&apos;nggi Faoliyat
              </h3>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-silver/5 flex items-center justify-center mb-4">
                  <Activity className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Hali faoliyat yo&apos;q
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Kurs yoki signal xarid qilinganda shu yerda ko&apos;rinadi
                </p>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Referral Section ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Sizning referral kodingiz
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Do&apos;stlaringizni taklif qiling va bonus oling
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <code className="inline-block px-4 py-2 rounded-lg bg-glass border border-glass-border text-silver font-mono text-sm tracking-widest select-all">
                      {referralCode}
                    </code>
                    <CopyButton code={referralCode} />
                  </div>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <div className="w-16 h-16 rounded-xl bg-silver/5 flex items-center justify-center">
                    <Share2 className="w-7 h-7 text-silver/50" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Telegram Links ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Telegram
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={TELEGRAM.BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Telegram Bot
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
                <a
                  href={TELEGRAM.MARKETING_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 h-10 px-4 rounded-lg bg-glass border border-glass-border text-foreground/80 font-medium text-sm hover:bg-glass-strong hover:text-foreground transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-silver" />
                  Kanal
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
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