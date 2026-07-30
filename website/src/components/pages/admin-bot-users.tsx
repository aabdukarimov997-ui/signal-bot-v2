'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Users, Search, Crown, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function AdminBotUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/bot/users?search=${search}&page=${page}&limit=30`);
      const data = await res.json();
      if (data.users) { setUsers(data.users); setTotalPages(data.totalPages || 1); }
    } catch { toast.error('Bot foydalanuvchilarini yuklashda xatolik'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Bot Foydalanuvchilari</h2>
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Ism, username yoki telegram ID..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-white/[0.03] border-glass-border" />
        </div>
      </div>
      <div className="rounded-lg border border-glass-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-glass-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Ism</TableHead>
              <TableHead className="text-muted-foreground">Username</TableHead>
              <TableHead className="text-muted-foreground">Telegram ID</TableHead>
              <TableHead className="text-muted-foreground">Faol obuna</TableHead>
              <TableHead className="text-muted-foreground">Jami to\'lov</TableHead>
              <TableHead className="text-muted-foreground">Sarflangan</TableHead>
              <TableHead className="text-muted-foreground">Sana</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Foydalanuvchilar topilmadi</TableCell></TableRow>
            )}
            {users.map((u: any) => (
              <TableRow key={u.id} className="border-glass-border hover:bg-white/[0.02]">
                <TableCell className="text-muted-foreground text-xs">{u.id}</TableCell>
                <TableCell className="font-medium text-foreground">{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">@{u.username || '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{u.telegram_id}</TableCell>
                <TableCell>
                  <Badge variant={u.active_subs > 0 ? 'default' : 'secondary'}
                    className={u.active_subs > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-muted-foreground'}>
                    {u.active_subs || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.total_payments || 0}</TableCell>
                <TableCell className="text-foreground font-mono text-xs">${parseFloat(u.total_spent || '0').toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(u.created_at)}</TableCell>
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
