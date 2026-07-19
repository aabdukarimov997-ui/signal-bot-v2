'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigationStore, useAuthStore } from '@/store';
import { ADMIN_NAV_ITEMS, TELEGRAM } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Home,
  GraduationCap,
  Activity,
  Crown,
  BarChart3,
  Newspaper,
  HelpCircle,
  Info,
  Mail,
  Users,
  Search,
  Image,
  CreditCard,
  Share2,
  Layout,
  DollarSign,
  Ticket,
  Send,
  Shield,
  Menu,
  LogOut,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Upload,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/* ─── Icon Lookup ──────────────────────────────────────────── */
const iconMap: Record<string, LucideIcon> = {
  Home,
  GraduationCap,
  Activity,
  Crown,
  BarChart3,
  Newspaper,
  HelpCircle,
  Info,
  Mail,
  Users,
  Search,
  Image,
  CreditCard,
  Share2,
  Layout,
  DollarSign,
  Ticket,
  Send,
  Shield,
};

/* ─── Helpers ──────────────────────────────────────────────── */
function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

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

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════ */
function SidebarContent({
  onNavigate,
}: {
  onNavigate?: (id: string) => void;
}) {
  const currentPage = useNavigationStore((s) => s.currentPage);
  const navigate = useNavigationStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);
  const nav = onNavigate ?? navigate;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-glass-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-silver/10">
          <Shield className="h-5 w-5 text-silver" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        <ul className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] ?? HelpCircle;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => nav(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-silver/10 text-silver font-medium'
                      : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-glass-border p-3 space-y-1">
        <button
          onClick={() => nav('home')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Asosiy sahifaga qaytish
        </button>
        <button
          onClick={() => {
            logout();
            nav('home');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col border-r border-glass-border bg-background/80 backdrop-blur-xl shrink-0">
      <SidebarContent />
    </aside>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 text-silver hover:bg-silver/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-background border-glass-border">
        <SheetHeader className="sr-only">
          <SheetTitle>Admin menyusi</SheetTitle>
        </SheetHeader>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — FOYDALANUVCHILAR
   ═══════════════════════════════════════════════════════════════ */
function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      toast.error('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (user: any) => {
    const newRole = user.role === 'USER' ? 'ADMIN' : 'USER';
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      toast.success(`${user.name || user.email} roli o'zgartirildi`);
      setConfirmId(null);
      fetchUsers();
    } catch {
      toast.error('Rolni o\'zgartirishda xatolik');
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.name?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Foydalanuvchilar</h2>
      <AdminGlassCard>
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.03] border-glass-border"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Ism</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Rol</TableHead>
                <TableHead className="text-muted-foreground">Telegram ID</TableHead>
                <TableHead className="text-muted-foreground">Yaratilgan</TableHead>
                <TableHead className="text-muted-foreground text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Foydalanuvchilar topilmadi
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => (
                <TableRow key={u.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="font-medium text-foreground">{u.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                      className={
                        u.role === 'ADMIN'
                          ? 'bg-silver/20 text-silver border-silver/30'
                          : 'bg-white/[0.05] text-muted-foreground border-glass-border'
                      }
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.telegramId || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {confirmId === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setConfirmId(null)}
                        >
                          Yo'q
                        </Button>
                        <Button
                          size="sm"
                          className="bg-silver/20 text-silver hover:bg-silver/30"
                          onClick={() => toggleRole(u)}
                        >
                          Ha
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-silver"
                        onClick={() => setConfirmId(u.id)}
                      >
                        {u.role === 'USER' ? 'Admin qilish' : 'User qilish'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminGlassCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — KURSLAR
   ═══════════════════════════════════════════════════════════════ */
function AdminCourses() {
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    starterPrice: 0,
    professionalPrice: 0,
    masterPrice: 0,
    starterFeatures: '',
    professionalFeatures: '',
    masterFeatures: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setForm({
          id: data.id ?? '',
          name: data.name ?? '',
          description: data.description ?? '',
          starterPrice: data.starterPrice ?? 0,
          professionalPrice: data.professionalPrice ?? 0,
          masterPrice: data.masterPrice ?? 0,
          starterFeatures: Array.isArray(data.starterFeatures)
            ? data.starterFeatures.join(', ')
            : data.starterFeatures ?? '',
          professionalFeatures: Array.isArray(data.professionalFeatures)
            ? data.professionalFeatures.join(', ')
            : data.professionalFeatures ?? '',
          masterFeatures: Array.isArray(data.masterFeatures)
            ? data.masterFeatures.join(', ')
            : data.masterFeatures ?? '',
        });
      } catch {
        toast.error('Kurs ma\'lumotlarini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        starterFeatures: form.starterFeatures
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        professionalFeatures: form.professionalFeatures
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        masterFeatures: form.masterFeatures
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      toast.success('Kurs muvaffaqiyatli saqlandi');
    } catch {
      toast.error('Kursni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const upd = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) return <LoadingState />;

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Kurslar</h2>
      <AdminGlassCard>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Kurs nomi</Label>
            <Input
              value={form.name}
              onChange={(e) => upd('name', e.target.value)}
              className="bg-white/[0.03] border-glass-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Tavsif</Label>
            <Textarea
              value={form.description}
              onChange={(e) => upd('description', e.target.value)}
              rows={4}
              className="bg-white/[0.03] border-glass-border"
            />
          </div>

          <Separator className="bg-glass-border" />

          <TierForm
            label="Starter"
            price={form.starterPrice}
            features={form.starterFeatures}
            onPriceChange={(v) => upd('starterPrice', v)}
            onFeaturesChange={(v) => upd('starterFeatures', v)}
          />
          <TierForm
            label="Professional"
            price={form.professionalPrice}
            features={form.professionalFeatures}
            onPriceChange={(v) => upd('professionalPrice', v)}
            onFeaturesChange={(v) => upd('professionalFeatures', v)}
          />
          <TierForm
            label="Master"
            price={form.masterPrice}
            features={form.masterFeatures}
            onPriceChange={(v) => upd('masterPrice', v)}
            onFeaturesChange={(v) => upd('masterFeatures', v)}
          />

          <div className="pt-2">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-silver/20 text-silver hover:bg-silver/30"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </div>
        </div>
      </AdminGlassCard>
    </>
  );
}

function TierForm({
  label,
  price,
  features,
  onPriceChange,
  onFeaturesChange,
}: {
  label: string;
  price: number;
  features: string;
  onPriceChange: (v: number) => void;
  onFeaturesChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-glass-border p-4">
      <h3 className="text-sm font-semibold text-silver">{label}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Narx (so'm)</Label>
          <Input
            type="number"
            value={price || ''}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
            className="bg-white/[0.03] border-glass-border"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Xususiyatlar (vergul bilan)</Label>
          <Input
            value={features}
            onChange={(e) => onFeaturesChange(e.target.value)}
            placeholder="Xususiyat 1, Xususiyat 2, ..."
            className="bg-white/[0.03] border-glass-border"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — SIGNAL
   ═══════════════════════════════════════════════════════════════ */
function AdminSignals() {
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    monthlyPrice: 0,
    quarterlyPrice: 0,
    semiannualPrice: 0,
    monthlyFeatures: '',
    quarterlyFeatures: '',
    semiannualFeatures: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/signals');
        const data = await res.json();
        setForm({
          id: data.id ?? '',
          name: data.name ?? '',
          description: data.description ?? '',
          monthlyPrice: data.monthlyPrice ?? 0,
          quarterlyPrice: data.quarterlyPrice ?? 0,
          semiannualPrice: data.semiannualPrice ?? 0,
          monthlyFeatures: Array.isArray(data.monthlyFeatures)
            ? data.monthlyFeatures.join(', ')
            : data.monthlyFeatures ?? '',
          quarterlyFeatures: Array.isArray(data.quarterlyFeatures)
            ? data.quarterlyFeatures.join(', ')
            : data.quarterlyFeatures ?? '',
          semiannualFeatures: Array.isArray(data.semiannualFeatures)
            ? data.semiannualFeatures.join(', ')
            : data.semiannualFeatures ?? '',
        });
      } catch {
        toast.error('Signal ma\'lumotlarini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        monthlyFeatures: form.monthlyFeatures
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        quarterlyFeatures: form.quarterlyFeatures
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        semiannualFeatures: form.semiannualFeatures
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await fetch('/api/signals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      toast.success('Signal ma\'lumotlari muvaffaqiyatli saqlandi');
    } catch {
      toast.error('Signalni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const upd = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) return <LoadingState />;

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Signal</h2>
      <AdminGlassCard>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Signal nomi</Label>
            <Input
              value={form.name}
              onChange={(e) => upd('name', e.target.value)}
              className="bg-white/[0.03] border-glass-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Tavsif</Label>
            <Textarea
              value={form.description}
              onChange={(e) => upd('description', e.target.value)}
              rows={4}
              className="bg-white/[0.03] border-glass-border"
            />
          </div>

          <Separator className="bg-glass-border" />

          <TierForm
            label="Oylik"
            price={form.monthlyPrice}
            features={form.monthlyFeatures}
            onPriceChange={(v) => upd('monthlyPrice', v)}
            onFeaturesChange={(v) => upd('monthlyFeatures', v)}
          />
          <TierForm
            label="Choraklik"
            price={form.quarterlyPrice}
            features={form.quarterlyFeatures}
            onPriceChange={(v) => upd('quarterlyPrice', v)}
            onFeaturesChange={(v) => upd('quarterlyFeatures', v)}
          />
          <TierForm
            label="Yillik (yarim yillik)"
            price={form.semiannualPrice}
            features={form.semiannualFeatures}
            onPriceChange={(v) => upd('semiannualPrice', v)}
            onFeaturesChange={(v) => upd('semiannualFeatures', v)}
          />

          <div className="pt-2">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-silver/20 text-silver hover:bg-silver/30"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </div>
        </div>
      </AdminGlassCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — BLOG
   ═══════════════════════════════════════════════════════════════ */
function AdminBlog() {
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
          className="bg-silver/20 text-silver hover:bg-silver/30"
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
                        className="h-8 w-8 text-muted-foreground hover:text-silver"
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
              className="bg-silver/20 text-silver hover:bg-silver/30"
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

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — SEO
   ═══════════════════════════════════════════════════════════════ */
function AdminSEO() {
  const [settings, setSettings] = useState({
    site_title: '',
    site_description: '',
    og_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings({
          site_title: data.site_title ?? '',
          site_description: data.site_description ?? '',
          og_image: data.og_image ?? '',
        });
      } catch {
        toast.error('Sozlamalarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      toast.success('Sozlamalar muvaffaqiyatli saqlandi');
    } catch {
      toast.error('Sozlamalarni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">SEO</h2>
      <AdminGlassCard>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Sayt nomi</Label>
            <Input
              value={settings.site_title}
              onChange={(e) => setSettings((p) => ({ ...p, site_title: e.target.value }))}
              placeholder="AAA Crypto Trading Academy"
              className="bg-white/[0.03] border-glass-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Sayt tavsifi</Label>
            <Textarea
              value={settings.site_description}
              onChange={(e) =>
                setSettings((p) => ({ ...p, site_description: e.target.value }))
              }
              rows={3}
              placeholder="Premium Crypto Trading Academy va Signal Platformasi"
              className="bg-white/[0.03] border-glass-border"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">OG Image URL</Label>
            <Input
              value={settings.og_image}
              onChange={(e) => setSettings((p) => ({ ...p, og_image: e.target.value }))}
              placeholder="https://example.com/og-image.jpg"
              className="bg-white/[0.03] border-glass-border"
            />
          </div>
          <div className="pt-2">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-silver/20 text-silver hover:bg-silver/30"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </div>
        </div>
      </AdminGlassCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — MEDIA (Placeholder)
   ═══════════════════════════════════════════════════════════════ */
function AdminMedia() {
  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Media</h2>
      <AdminGlassCard className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-silver/10 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-silver/50" />
        </div>
        <p className="text-muted-foreground text-lg font-medium">
          Media boshqaruvi tez orada qo&apos;shiladi
        </p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Rasm, video va fayllarni boshqarish imkoniyati
        </p>
      </AdminGlassCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — ANALYTICS
   ═══════════════════════════════════════════════════════════════ */
function AdminAnalytics() {
  const [data, setData] = useState<{
    totalUsers: number;
    totalPayments: number;
    revenue: number;
    pageViewsByType: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch {
        toast.error('Analitikani yuklashda xatolik');
      } finally {
        setLoading(false);
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

/* ═══════════════════════════════════════════════════════════════
   SECTION 8 — TO'LOVLAR
   ═══════════════════════════════════════════════════════════════ */
function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = useCallback(async () => {
    try {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/payments${query}`);
      const data = await res.json();
      if (Array.isArray(data)) setPayments(data);
    } catch {
      toast.error('To\'lovlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    REFUNDED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-foreground">To&apos;lovlar</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-white/[0.03] border-glass-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a09] border-glass-border">
            <SelectItem value="ALL">Barchasi</SelectItem>
            <SelectItem value="PENDING">Kutilmoqda</SelectItem>
            <SelectItem value="COMPLETED">Tugallangan</SelectItem>
            <SelectItem value="FAILED">Muvaffaqiyatsiz</SelectItem>
            <SelectItem value="REFUNDED">Qaytarilgan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <AdminGlassCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Foydalanuvchi</TableHead>
                <TableHead className="text-muted-foreground">Turi</TableHead>
                <TableHead className="text-muted-foreground">Plan</TableHead>
                <TableHead className="text-muted-foreground">Summa</TableHead>
                <TableHead className="text-muted-foreground">Holat</TableHead>
                <TableHead className="text-muted-foreground">Sana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    To&apos;lovlar topilmadi
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="text-foreground">
                    {p.user?.name || p.user?.email || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.type}</TableCell>
                  <TableCell className="text-muted-foreground">{p.plan || '—'}</TableCell>
                  <TableCell className="text-foreground font-medium">
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColor[p.status] ?? 'bg-white/[0.05] text-muted-foreground'}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(p.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminGlassCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 9 — REFERRAL
   ═══════════════════════════════════════════════════════════════ */
function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/referrals');
        const data = await res.json();
        if (Array.isArray(data)) setReferrals(data);
      } catch {
        toast.error('Referral ma\'lumotlarini yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Referral</h2>
      <AdminGlassCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Taklif qiluvchi</TableHead>
                <TableHead className="text-muted-foreground">Taklif qilingan</TableHead>
                <TableHead className="text-muted-foreground">Kod</TableHead>
                <TableHead className="text-muted-foreground">Sana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Referral ma&apos;lumotlari yo&apos;q
                  </TableCell>
                </TableRow>
              )}
              {referrals.map((r) => (
                <TableRow key={r.id} className="border-glass-border hover:bg-white/[0.02]">
                  <TableCell className="text-foreground">
                    {r.referrer?.name || r.referrer?.email || '—'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {r.referred?.name || r.referred?.email || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-silver/10 text-silver border-silver/20">
                      {r.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(r.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminGlassCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — BANNERLAR
   ═══════════════════════════════════════════════════════════════ */
function AdminBanners() {
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
          className="bg-silver/20 text-silver hover:bg-silver/30"
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
                        className="h-8 w-8 text-muted-foreground hover:text-silver"
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
              className="bg-silver/20 text-silver hover:bg-silver/30"
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

/* ═══════════════════════════════════════════════════════════════
   SECTION 11 — NARXLAR
   ═══════════════════════════════════════════════════════════════ */
function AdminPricing() {
  const [course, setCourse] = useState<any>(null);
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigationStore((s) => s.navigate);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/signals'),
        ]);
        const cData = await cRes.json();
        const sData = await sRes.json();
        setCourse(cData);
        setSignal(sData);
      } catch {
        toast.error('Narxlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Narxlar</h2>

      <AdminGlassCard className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-silver/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-silver" />
          </div>
          <p className="text-muted-foreground text-sm">
            Barcha narxlar Admin Panel orqali boshqariladi. Tahrirlash uchun tegishli sahifaga o&apos;ting.
          </p>
        </div>
      </AdminGlassCard>

      {/* Course Pricing */}
      <h3 className="text-lg font-semibold text-foreground mb-3">Kurs narxlari</h3>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: 'Starter', price: course?.starterPrice },
          { label: 'Professional', price: course?.professionalPrice },
          { label: 'Master', price: course?.masterPrice },
        ].map((tier) => (
          <AdminGlassCard key={tier.label}>
            <p className="text-muted-foreground text-xs mb-1">{tier.label}</p>
            <p className="text-foreground text-2xl font-bold">{formatCurrency(tier.price ?? 0)}</p>
          </AdminGlassCard>
        ))}
        <div className="sm:col-span-3 flex justify-end">
          <Button
            variant="ghost"
            className="text-silver hover:text-silver hover:bg-silver/10"
            onClick={() => navigate('admin-courses')}
          >
            Kurslarni tahrirlash
            <Pencil className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Signal Pricing */}
      <h3 className="text-lg font-semibold text-foreground mb-3">Signal narxlari</h3>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: 'Oylik', price: signal?.monthlyPrice },
          { label: 'Choraklik', price: signal?.quarterlyPrice },
          { label: 'Yarim yillik', price: signal?.semiannualPrice },
        ].map((tier) => (
          <AdminGlassCard key={tier.label}>
            <p className="text-muted-foreground text-xs mb-1">{tier.label}</p>
            <p className="text-foreground text-2xl font-bold">{formatCurrency(tier.price ?? 0)}</p>
          </AdminGlassCard>
        ))}
        <div className="sm:col-span-3 flex justify-end">
          <Button
            variant="ghost"
            className="text-silver hover:text-silver hover:bg-silver/10"
            onClick={() => navigate('admin-signals')}
          >
            Signallarni tahrirlash
            <Pencil className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 12 — KUPONLAR
   ═══════════════════════════════════════════════════════════════ */
function AdminCoupons() {
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
          className="bg-silver/20 text-silver hover:bg-silver/30"
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
                  <TableCell className="font-mono font-medium text-silver">{c.code}</TableCell>
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
                        className="h-8 w-8 text-muted-foreground hover:text-silver"
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
              className="bg-silver/20 text-silver hover:bg-silver/30"
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

/* ═══════════════════════════════════════════════════════════════
   SECTION 13 — TELEGRAM
   ═══════════════════════════════════════════════════════════════ */
function AdminTelegram() {
  const links = [
    { label: 'Marketing kanali', value: TELEGRAM.MARKETING_CHANNEL, icon: Send },
    { label: 'Bot', value: TELEGRAM.BOT, icon: Crown },
    { label: 'Yordam', value: TELEGRAM.HELP, icon: HelpCircle },
  ];

  return (
    <>
      <h2 className="text-xl font-bold text-foreground mb-4">Telegram</h2>

      <AdminGlassCard className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Send className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-muted-foreground text-sm">
            Telegram orqali barcha to&apos;lov va obuna boshqaruvi amalga oshiriladi
          </p>
        </div>
      </AdminGlassCard>

      <div className="space-y-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <AdminGlassCard key={link.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-silver/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-silver" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.value}</p>
                  </div>
                </div>
                <a
                  href={link.value.startsWith('@') ? `https://t.me/${link.value.slice(1)}` : link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-silver hover:text-silver/80 transition-colors"
                >
                  Ochiq
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </AdminGlassCard>
          );
        })}
      </div>

      {/* Placeholder statistics */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-3">Statistika</h3>
        <AdminGlassCard className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-silver/10 flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-silver/50" />
          </div>
          <p className="text-muted-foreground text-sm">
            Telegram statistikasi tez orada qo&apos;shiladi
          </p>
        </AdminGlassCard>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════ */
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-silver" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION ROUTER
   ═══════════════════════════════════════════════════════════════ */
function AdminContent() {
  const currentPage = useNavigationStore((s) => s.currentPage);

  switch (currentPage) {
    case 'admin-users':
      return <AdminUsers />;
    case 'admin-courses':
      return <AdminCourses />;
    case 'admin-signals':
      return <AdminSignals />;
    case 'admin-blog':
      return <AdminBlog />;
    case 'admin-seo':
      return <AdminSEO />;
    case 'admin-media':
      return <AdminMedia />;
    case 'admin-analytics':
      return <AdminAnalytics />;
    case 'admin-payments':
      return <AdminPayments />;
    case 'admin-referrals':
      return <AdminReferrals />;
    case 'admin-banners':
      return <AdminBanners />;
    case 'admin-pricing':
      return <AdminPricing />;
    case 'admin-coupons':
      return <AdminCoupons />;
    case 'admin-telegram':
      return <AdminTelegram />;
    default:
      return <AdminUsers />;
  }
}

/* ═══════════════════════════════════════════════════════════════
   ACCESS DENIED
   ═══════════════════════════════════════════════════════════════ */
function AccessDenied() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <Shield className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Kirish taqiqlangan</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Bu sahifaga kirish uchun admin huquqlari talab etiladi. Iltimos, tizimga kiring.
        </p>
        <Button
          onClick={() => navigate('login')}
          className="bg-silver/20 text-silver hover:bg-silver/30"
        >
          Tizimga kirish
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════ */
export default function AdminPanel() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role !== 'ADMIN') {
    return <AccessDenied />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <MobileSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
        <div className="p-4 pt-16 lg:pt-6 lg:p-8 max-w-6xl mx-auto">
          <AdminContent />
        </div>
      </main>
    </div>
  );
}