'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, DollarSign, BarChart3, Send, Crown, Loader2 } from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────── */
function formatCurrency(n: number) {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(n) + ' so\'m';
}

function AdminGlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card p-6 ${className}`}>{children}</div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>
  );
}

/* ─── Section ──────────────────────────────────────────────── */
export default function AdminAnalytics() {
  const [data, setData] = useState<{
    totalUsers: number;
    totalPayments: number;
    revenue: number;
    pageViewsByType: Record<string, number>;
  } | null>(null);
  const [botData, setBotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [botLoading, setBotLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [siteRes, botRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/bot/stats'),
        ]);
        const siteData = await siteRes.json();
        let botStats = null;
        try {
          botStats = await botRes.json();
        } catch {}
        setData(siteData);
        setBotData(botStats);
      } catch {
        toast.error('Analitikani yuklashda xatolik');
      } finally {
        setLoading(false);
        setBotLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  const totalPageViews = data
    ? Object.values(data.pageViewsByType).reduce((a, b) => a + b, 0)
    : 0;

  const cards = [
    {
      label: 'Jami foydalanuvchilar',
      value: data?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Jami to\'lovlar',
      value: data?.totalPayments ?? 0,
      icon: CreditCard,
      color: 'text-emerald-400',
    },
    {
      label: 'Tushum',
      value: data ? formatCurrency(data.revenue) : '0',
      icon: DollarSign,
      color: 'text-yellow-400',
    },
    {
      label: 'Sahifa ko\'rishlar',
      value: totalPageViews,
      icon: BarChart3,
      color: 'text-purple-400',
    },
  ];

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <AdminGlassCard key={c.label} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                <Icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{c.label}</p>
                <p className="text-foreground text-xl font-bold">{c.value}</p>
              </div>
            </AdminGlassCard>
          );
        })}
      </div>

      {/* Bot Statistics */}
      {botData && !botLoading && (
        <>
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Send className="h-5 w-5 text-gold" />
              Telegram Bot Statistikasi
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Bot foydalanuvchilari</p>
                <p className="text-foreground text-xl font-bold">{botData.totalUsers}</p>
              </div>
            </AdminGlassCard>

            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <Crown className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Faol obunalar</p>
                <p className="text-foreground text-xl font-bold">{botData.activeSubscriptions}</p>
              </div>
            </AdminGlassCard>

            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Oyilik tushum</p>
                <p className="text-foreground text-xl font-bold">{formatCurrency(botData.monthlyRevenue)}</p>
              </div>
            </AdminGlassCard>

            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Kutilayotgan to\'lovlar</p>
                <p className="text-foreground text-xl font-bold">{botData.pendingPayments}</p>
              </div>
            </AdminGlassCard>
          </div>

          {/* Today's stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Bugun yangi foydalanuvchi</p>
                <p className="text-foreground text-xl font-bold">{botData.todayNewUsers}</p>
              </div>
            </AdminGlassCard>
            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Crown className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Bugun yangi obuna</p>
                <p className="text-foreground text-xl font-bold">{botData.todayNewSubscriptions}</p>
              </div>
            </AdminGlassCard>
            <AdminGlassCard className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Jami tushum</p>
                <p className="text-foreground text-xl font-bold">{formatCurrency(botData.totalRevenue)}</p>
              </div>
            </AdminGlassCard>
          </div>

          {/* Subscriptions by type */}
          {botData.subscriptionsByType?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Obuna turlari bo&apos;yicha
              </h3>
              <AdminGlassCard>
                <div className="space-y-2">
                  {botData.subscriptionsByType.map((item: any) => (
                    <div key={item.product_type} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground capitalize">{item.product_type}</span>
                      <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                        {item.count} ta faol
                      </Badge>
                    </div>
                  ))}
                </div>
              </AdminGlassCard>
            </div>
          )}
        </>
      )}

      {data && data.pageViewsByType && Object.keys(data.pageViewsByType).length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Sahifa ko\'rishlar turi bo&apos;yicha
          </h3>
          <AdminGlassCard>
            <div className="space-y-2">
              {Object.entries(data.pageViewsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">{type}</span>
                  <Badge variant="secondary" className="bg-white/[0.05] text-foreground border-glass-border">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </AdminGlassCard>
        </div>
      )}
    </>
  );
}
