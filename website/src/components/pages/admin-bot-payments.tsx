'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CreditCard, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('uz-UZ', { style: 'decimal', minimumFractionDigits: 0 }).format(n) + " so'm";
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function AdminBotPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`/api/bot/payments?status=${status}&page=${page}&limit=30`);
      const data = await res.json();
      if (data.payments) { setPayments(data.payments); setTotalPages(data.totalPages || 1); }
    } catch { toast.error('To\'lovlarni yuklashda xatolik'); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Bot To'lovlari</h2>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44 bg-white/[0.03] border-glass-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a09] border-glass-border">
            <SelectItem value="ALL">Barchasi</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="approved">Tasdiqlangan</SelectItem>
            <SelectItem value="rejected">Bekor qilingan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border border-glass-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-glass-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Foydalanuvchi</TableHead>
              <TableHead className="text-muted-foreground">Turi</TableHead>
              <TableHead className="text-muted-foreground">Usul</TableHead>
              <TableHead className="text-muted-foreground">Summa</TableHead>
              <TableHead className="text-muted-foreground">Holat</TableHead>
              <TableHead className="text-muted-foreground">Sana</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">To'lovlar topilmadi</TableCell></TableRow>
            )}
            {payments.map((p: any) => (
              <TableRow key={p.id} className="border-glass-border hover:bg-white/[0.02]">
                <TableCell className="text-foreground">{p.full_name || '—'}<br /><span className="text-xs text-muted-foreground">@{p.username || '—'}</span></TableCell>
                <TableCell className="text-muted-foreground capitalize">{p.product_type}</TableCell>
                <TableCell className="text-muted-foreground">{p.payment_method}</TableCell>
                <TableCell className="text-foreground font-medium">{formatCurrency(parseFloat(p.amount || '0'))}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusColors[p.status] || 'bg-white/[0.05] text-muted-foreground'}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(p.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-muted-foreground">Oldingi</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="text-muted-foreground">Keyingi</Button>
        </div>
      )}
    </>
  );
}
