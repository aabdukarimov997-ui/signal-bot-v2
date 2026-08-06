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
export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    link: '',
    isActive: true,
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setBanners(data);
    } catch {
      toast.error('Bannerlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', imageUrl: '', link: '', isActive: true, order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (banner: any) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      link: banner.link,
      isActive: banner.isActive,
      order: banner.order,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/banners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success('Banner muvaffaqiyatli yangilandi');
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        toast.success('Banner muvaffaqiyatli yaratildi');
      }
      setDialogOpen(false);
      fetchBanners();
    } catch {
      toast.error('Bannerni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async () => {
    if (!deleteId) return;
    try {
      await fetch('/api/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      toast.success('Banner muvaffaqiyatli o\'chirildi');
      setDeleteId(null);
      fetchBanners();
    } catch {
      toast.error('Bannerni o\'chirishda xatolik');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Bannerlar</h2>
        <Button
          onClick={openNew}
          className="bg-gold/20 text-gold hover:bg-gold/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi banner
        </Button>
      </div>
      <AdminGlassCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Sarlavha</TableHead>
                <TableHead className="text-muted-foreground">Pastki sarlavha</TableHead>
                <TableHead className="text-muted-foreground">Havola</TableHead>
                <TableHead className="text-muted-foreground">Holat</TableHead>
                <TableHead className="text-muted-foreground">Tartib</TableHead>
                <TableHead className="text-muted-foreground text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Hali banner yo&apos;q
                  </TableCell>
                </TableRow>
              )}
              {banners.map((b) => (
                <TableRow key={b.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-foreground">{b.title || '—'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[150px] truncate">
                    {b.subtitle || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[120px] truncate">
                    {b.link || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={b.isActive ? 'default' : 'secondary'}
                      className={
                        b.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-white/[0.05] text-muted-foreground border-glass-border'
                      }
                    >
                      {b.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{b.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-gold"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteId(b.id)}
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
              {editing ? 'Bannerni tahrirlash' : 'Yangi banner'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Sarlavha</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Pastki sarlavha</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Rasm URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="https://example.com/banner.jpg"
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Havola</Label>
              <Input
                value={form.link}
                onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tartib raqami</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) || 0 }))}
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
              Bannerni o&apos;chirish
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Ushbu bannerni o&apos;chirishni xohlaysizmi? Bu amalni qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground">Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteBanner}
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
