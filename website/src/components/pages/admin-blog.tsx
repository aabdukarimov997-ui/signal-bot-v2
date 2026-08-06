'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigationStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/blog?all=true');
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch {
      toast.error('Maqolalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
      .replace(/^-|-$/g, '');

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', slug: '', content: '', excerpt: '', published: false });
    setDialogOpen(true);
  };

  const openEdit = (post: any) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Sarlavha kiritilishi shart');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success('Maqola muvaffaqiyatli yangilandi');
      } else {
        const slug = form.slug || generateSlug(form.title);
        await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, slug, authorId: 'admin' }),
        });
        toast.success('Maqola muvaffaqiyatli yaratildi');
      }
      setDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error('Maqolani saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    if (!deleteId) return;
    try {
      await fetch('/api/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });
      toast.success('Maqola muvaffaqiyatli o\'chirildi');
      setDeleteId(null);
      fetchPosts();
    } catch {
      toast.error('Maqolani o\'chirishda xatolik');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Blog</h2>
        <Button
          onClick={openNew}
          className="bg-gold/20 text-gold hover:bg-gold/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi maqola
        </Button>
      </div>
      <AdminGlassCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Sarlavha</TableHead>
                <TableHead className="text-muted-foreground">Slug</TableHead>
                <TableHead className="text-muted-foreground">Holat</TableHead>
                <TableHead className="text-muted-foreground">Sana</TableHead>
                <TableHead className="text-muted-foreground text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Hali maqola yo'q
                  </TableCell>
                </TableRow>
              )}
              {posts.map((post) => (
                <TableRow key={post.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                    {post.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.published ? 'default' : 'secondary'}
                      className={
                        post.published
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {post.published ? 'Nashr etilgan' : 'Qoralama'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-gold"
                        onClick={() => openEdit(post)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteId(post.id)}
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
              {editing ? 'Maqolani tahrirlash' : 'Yangi maqola'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Sarlavha</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm((p) => ({ ...p, title: e.target.value }));
                  if (!editing) {
                    setForm((p) => ({ ...p, slug: generateSlug(e.target.value) }));
                  }
                }}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Qisqacha</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                rows={2}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Mazmun</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                rows={8}
                className="bg-white/[0.03] border-glass-border"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm((p) => ({ ...p, published: v }))}
              />
              <Label className="text-muted-foreground">Nashr etilgan</Label>
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
              Maqolani o'chirish
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Ushbu maqolani o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground">Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={deletePost}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
