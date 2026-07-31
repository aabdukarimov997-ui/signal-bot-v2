'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  History,
  Users,
  Gift,
  Timer,
  BadgeCheck,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { useNavigationStore, useAuthStore } from '@/store';
import { TELEGRAM } from '@/lib/constants';
import { Button } from '@/components/ui/button';

/* ────────────────────────────────────────────
   Types (bot dashboard data)
   ──────────────────────────────────────────── */
interface BotSubscription {
  id: number;
  tariffName: string;
  productType: string;
  status: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  inviteLink?: string | null;
}

interface BotPayment {
  id: number;
  productType: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface BotDashboard {
  user: {
    id: number;
    telegramId: string;
    fullName: string;
    username?: string | null;
    referralCode: string;
    referralBonusDays: number;
  };
  subscription: BotSubscription | null;
  signalHistory: BotSubscription[];
  payments: BotPayment[];
  referral: {
    referralCode: string;
    referralCount: number;
    activeCount: number;
    bonusDays: number;
  };
}

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function statusLabel(status: string): { text: string; ok: boolean } {
  switch (status) {
    case 'active':
      return { text: 'Faol', ok: true };
    case 'expired':
      return { text: 'Tugagan', ok: false };
    case 'pending':
      return { text: 'Kutilmoqda', ok: false };
    case 'approved':
      return { text: 'Tasdiqlangan', ok: true };
    case 'rejected':
      return { text: 'Rad etilgan', ok: false };
    default:
      return { text: status, ok: false };
  }
}

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
   Quick actions
   ──────────────────────────────────────────── */
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
  const [botData, setBotData] = useState<BotDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [botError, setBotError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('login');
    }
  }, [user, navigate]);

  // Resolve bot userId from localStorage (TMA) or URL query params
  const resolveBotUserId = useCallback((): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      const params = new URLSearchParams(window.location.search);
      const qUserId = params.get('userId');
      if (qUserId) return qUserId;
      const saved = localStorage.getItem('tma_user');
      if (saved) {
        const tmaUser = JSON.parse(saved);
        if (tmaUser?.id) return String(tmaUser.id);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Fetch bot dashboard data
  useEffect(() => {
    async function loadBotData() {
      const botUserId = resolveBotUserId();
      if (!botUserId) {
        setLoading(false);
        setBotData(null);
        return;
      }
      try {
        const res = await fetch(`/api/tma/dashboard?userId=${encodeURIComponent(botUserId)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setBotData(data);
        setBotError(null);
      } catch (err: any) {
        console.error('Bot dashboard load error:', err);
        setBotError(err?.message || 'Maʼlumotlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    }
    loadBotData();
  }, [resolveBotUserId]);

  const referralCode = useMemo(() => {
    return botData?.referral.referralCode || '—';
  }, [botData]);

  // Progress bar width for active subscription (declared BEFORE early return to
  // keep React hook order stable across the authenticated/redirect states)
  const progress = useMemo(() => {
    const sub = botData?.subscription ?? null;
    if (!sub) return 0;
    const start = new Date(sub.startDate).getTime();
    const end = new Date(sub.endDate).getTime();
    const now = Date.now();
    if (end <= start) return 100;
    const total = end - start;
    const remaining = Math.max(0, end - now);
    return Math.min(100, Math.max(0, Math.round((remaining / total) * 100)));
  }, [botData]);

  // Don't render anything while redirecting
  if (!user) return null;

  const filteredActions = quickActions.filter(
    (action) => !action.adminOnly || user.role === 'ADMIN'
  );

  const subscription = botData?.subscription ?? null;
  const activeSubCount = botData?.signalHistory.filter((s) => s.status === 'active').length ?? 0;
  const paymentsCount = botData?.payments.length ?? 0;
  const referralCount = botData?.referral.referralCount ?? 0;

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
                <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center">
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[11px] font-medium uppercase tracking-wider">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {subscription && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-[11px] font-medium uppercase tracking-wider">
                        <BadgeCheck className="w-3 h-3" />
                        {subscription.tariffName}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold/50" />
                      {user.email}
                    </span>
                    {botData?.user.telegramId && (
                      <span className="inline-flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-gold/50" />
                        TG: {botData.user.telegramId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Subscription Status (bot data) ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Activity className="w-5 h-5 text-gold" />
                  Obuna Holati
                </h3>
                {loading && <Loader2 className="w-4 h-4 text-gold animate-spin" />}
              </div>

              {subscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Tarif</p>
                      <p className="text-sm font-semibold text-gold truncate">
                        {subscription.tariffName}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Boshlanishi</p>
                      <p className="text-sm font-medium">{formatDate(subscription.startDate)}</p>
                    </div>
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Tugash sanasi</p>
                      <p className="text-sm font-medium">{formatDate(subscription.endDate)}</p>
                    </div>
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Qolgan kunlar</p>
                      <p className="text-sm font-semibold text-gold flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        {subscription.daysLeft} kun
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="h-2.5 rounded-full bg-gold/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-amber"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>{formatDate(subscription.startDate)}</span>
                      <span>
                        {subscription.daysLeft <= 7 ? (
                          <span className="text-amber-400 font-medium">
                            ⚠️ {subscription.daysLeft} kun qoldi — uzaytiring!
                          </span>
                        ) : (
                          `${subscription.daysLeft} kun qoldi`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : botError ? (
                <p className="text-sm text-red-400">{botError}</p>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gold/5 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Faol obuna topilmadi
                  </p>
                  <p className="text-xs text-muted-foreground/60 mb-4">
                    Signal yoki kursga obuna boʻling
                  </p>
                  <Button variant="outline" onClick={() => navigate('signals')} className="h-10 px-4 text-sm text-gold border-gold/20 hover:bg-gold/10">
                    <Activity className="w-4 h-4" />
                    Obuna boʻlish
                  </Button>
                </div>
              )}
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Dashboard Stats ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                key: 'signals',
                label: 'Signal',
                value: activeSubCount > 0 ? String(activeSubCount) : '—',
                sublabel: 'Faol obuna',
                icon: Activity,
              },
              {
                key: 'payments',
                label: "To'lovlar",
                value: String(paymentsCount),
                sublabel: 'Jami toʻlov',
                icon: CreditCard,
              },
              {
                key: 'referrals',
                label: 'Referral',
                value: String(referralCount),
                sublabel: 'Takliflar',
                icon: Share2,
              },
              {
                key: 'bonus',
                label: 'Bonus kunlar',
                value: String(botData?.referral.bonusDays ?? 0),
                sublabel: 'Hisobingizda',
                icon: Gift,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <GlassCard key={stat.key} index={i} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gradient-gold">
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

      {/* ── Signal History ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <History className="w-5 h-5 text-gold" />
                Signal Tarixi
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                </div>
              ) : botData && botData.signalHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-4">Tarif</th>
                        <th className="pb-2 pr-4">Boshlanishi</th>
                        <th className="pb-2 pr-4">Tugashi</th>
                        <th className="pb-2">Holat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {botData.signalHistory.map((s) => {
                        const st = statusLabel(s.status);
                        return (
                          <tr key={s.id} className="border-b border-glass-border/50 last:border-0">
                            <td className="py-3 pr-4 font-medium">{s.tariffName}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{formatDate(s.startDate)}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{formatDate(s.endDate)}</td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                  st.ok
                                    ? 'bg-emerald/10 text-emerald'
                                    : 'bg-red-500/10 text-red-400'
                                }`}
                              >
                                {st.ok ? <BadgeCheck className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {st.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-gold/5 flex items-center justify-center mb-3">
                    <History className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Signal tarixi boʻsh</p>
                </div>
              )}
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Payment History ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
                <CreditCard className="w-5 h-5 text-gold" />
                Toʻlovlar Tarixi
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                </div>
              ) : botData && botData.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-4">Turi</th>
                        <th className="pb-2 pr-4">Summa</th>
                        <th className="pb-2 pr-4">Usul</th>
                        <th className="pb-2 pr-4">Sana</th>
                        <th className="pb-2">Holat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {botData.payments.map((p) => {
                        const st = statusLabel(p.status);
                        return (
                          <tr key={p.id} className="border-b border-glass-border/50 last:border-0">
                            <td className="py-3 pr-4 font-medium capitalize">
                              {p.productType === 'signal' ? 'Signal' : p.productType}
                            </td>
                            <td className="py-3 pr-4 text-gold font-semibold">
                              ${Number(p.amount).toFixed(2)}
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground capitalize">
                              {p.paymentMethod.replace(/_/g, ' ')}
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground">
                              {formatDate(p.createdAt)}
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                  st.ok
                                    ? 'bg-emerald/10 text-emerald'
                                    : p.status === 'pending'
                                      ? 'bg-amber-400/10 text-amber-400'
                                      : 'bg-red-500/10 text-red-400'
                                }`}
                              >
                                {st.ok ? (
                                  <BadgeCheck className="w-3 h-3" />
                                ) : p.status === 'pending' ? (
                                  <Clock className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {st.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-gold/5 flex items-center justify-center mb-3">
                    <CreditCard className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Toʻlovlar tarixi boʻsh</p>
                </div>
              )}
            </GlassCard>
          </AnimatedSection>
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
                            ? 'h-10 px-4 text-sm bg-gold/15 border-gold/20 text-gold hover:bg-gold/25 hover:text-gold'
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

      {/* ── Referral Section ── */}
      <section className="pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
                    <Users className="w-5 h-5 text-gold" />
                    Sizning referral kodingiz
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Doʻstlaringizni taklif qiling va bonus kunlar oling
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <code className="inline-block px-4 py-2 rounded-lg bg-glass border border-glass-border text-gold font-mono text-sm tracking-widest select-all">
                      {referralCode}
                    </code>
                    <CopyButton code={referralCode} />
                  </div>

                  {/* Referral stats */}
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Takliflar</p>
                      <p className="text-xl font-bold text-gradient-gold">{referralCount}</p>
                    </div>
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Faol obunachilar</p>
                      <p className="text-xl font-bold text-gradient-gold">{botData?.referral.activeCount ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-gold/5 border border-gold/10 p-3 col-span-2 sm:col-span-1">
                      <p className="text-xs text-muted-foreground mb-1">Bonus kunlar</p>
                      <p className="text-xl font-bold text-gradient-gold">{botData?.referral.bonusDays ?? 0}</p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <div className="w-16 h-16 rounded-xl bg-gold/5 flex items-center justify-center">
                    <Share2 className="w-7 h-7 text-gold/50" />
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
                  <MessageSquare className="w-4 h-4 text-gold" />
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
