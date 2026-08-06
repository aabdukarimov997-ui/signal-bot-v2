'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
  });
  const [saving, setSaving] = useState(false);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/faq');
      const data = await res.json();
      if (Array.isArray(data)) setFaqs(data);
    } catch {
      toast.error('FAQ larni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openNew = () => {
    setEditing(null);
    setForm({ question: '', answer: '', category: 'general', order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (faq: any) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Savol va javob kiritilishi shart');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/faq', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success('FAQ muvaffaqiyatli yangilandi');
      } else {
        await fetch('/api/faq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        toast.success('FAQ muvaffaqiyatli yaratildi');
      }
      setDialogOpen(false);
      fetchFaqs();
    } catch {
      toast.error('FAQ ni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async () => {
    if (!deleteId) return;
    try {
      await fetch('/api/faq', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      toast.success('FAQ muvaffaqiyatli o\'chirildi');
      setDeleteId(null);
      fetchFaqs();
    } catch {
      toast.error('FAQ ni o\'chirishda xatolik');
    }
  };

  if (loading) return <LoadingState />;

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">FAQ</h2>
        <Button
          onClick={openNew}
          className="bg-gold/20 text-gold hover:bg-gold/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi savol
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="bg-gold/10 text-gold border-gold/20">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <AdminGlassCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Savol</TableHead>
                <TableHead className="text-muted-foreground">Kategoriya</TableHead>
                <TableHead className="text-muted-foreground">Tartib</TableHead>
                <TableHead className="text-muted-foreground text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Hali FAQ yo&apos;q
                  </TableCell>
                </TableRow>
              )}
              {faqs.map((faq) => (
                <TableRow key={faq.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-foreground max-w-[300px]">
                    <div className="truncate">{faq.question}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gold/10 text-gold/80 border-gold/20">
                      {faq.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{faq.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-gold"
                        onClick={() => openEdit(faq)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteId(faq.id)}
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
              {editing ? 'FAQ ni tahrirlash' : 'Yangi savol'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Savol</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Javob</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                rows={5}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Kategoriya</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="general"
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
              Savolni o&apos;chirish
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Ushbu savolni o&apos;chirishni xohlaysizmi? Bu amalni qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground">Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteFaq}
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
