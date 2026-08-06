'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────── */
function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    discountPercent: 0,
    validFrom: '',
    validTo: '',
    maxUses: 100,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch {
      toast.error('Kuponlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openNew = () => {
    setEditing(null);
    setForm({
      code: '',
      discountPercent: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '',
      maxUses: 100,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validTo: coupon.validTo ? coupon.validTo.split('T')[0] : '',
      maxUses: coupon.maxUses,
      isActive: coupon.isActive,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.code.trim() || !form.validTo) {
      toast.error('Kod va amal qilish muddati kiritilishi shart');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success('Kupon muvaffaqiyatli yangilandi');
      } else {
        await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        toast.success('Kupon muvaffaqiyatli yaratildi');
      }
      setDialogOpen(false);
      fetchCoupons();
    } catch {
      toast.error('Kuponni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async () => {
    if (!deleteId) return;
    try {
      await fetch('/api/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      toast.success('Kupon muvaffaqiyatli o\'chirildi');
      setDeleteId(null);
      fetchCoupons();
    } catch {
      toast.error('Kuponni o\'chirishda xatolik');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Kuponlar</h2>
        <Button
          onClick={openNew}
          className="bg-gold/20 text-gold hover:bg-gold/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi kupon
        </Button>
      </div>
      <AdminGlassCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Kod</TableHead>
                <TableHead className="text-muted-foreground">Chegirma</TableHead>
                <TableHead className="text-muted-foreground">Amal qilish muddati</TableHead>
                <TableHead className="text-muted-foreground">Foydalanish</TableHead>
                <TableHead className="text-muted-foreground">Holat</TableHead>
                <TableHead className="text-muted-foreground text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Hali kupon yo&apos;q
                  </TableCell>
                </TableRow>
              )}
              {coupons.map((c) => (
                <TableRow key={c.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="font-mono font-medium text-gold">{c.code}</TableCell>
                  <TableCell className="text-foreground">{c.discountPercent}%</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(c.validTo)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.usedCount}/{c.maxUses}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.isActive ? 'default' : 'secondary'}
                      className={
                        c.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/[0.05] text-muted-foreground border-glass-border'
                      }
                    >
                      {c.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-gold"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminGlassCard>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0a0a09] border-glass-border max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editing ? 'Kuponni tahrirlash' : 'Yangi kupon'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Kupon kodi</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                className="bg-white/[0.03] border-glass-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Chegirma foizi</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discountPercent}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountPercent: Number(e.target.value) || 0 }))
                }
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Boshlanish sanasi</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
                  className="bg-white/[0.03] border-glass-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tugash sanasi</Label>
                <Input
                  type="date"
                  value={form.validTo}
                  onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))}
                  className="bg-white/[0.03] border-glass-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Maksimal foydalanish</Label>
              <Input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxUses: Number(e.target.value) || 1 }))
                }
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
              <Label className="text-muted-foreground">Faol</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-muted-foreground"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-gold/20 text-gold hover:bg-gold/30"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Yangilash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0a0a09] border-glass-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Kuponni o&apos;chirish
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Ushbu kuponni o&apos;chirishni xohlaysizmi? Bu amalni qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground">Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCoupon}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              O&apos;chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
