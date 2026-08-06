'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ImagePlus, Trash2, Eye } from 'lucide-react';
import { useNavigationStore } from '@/store';

export default function AdminAppearance() {
  const [bgUrl, setBgUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGlass, setShowGlass] = useState(false);
  const [showDim, setShowDim] = useState(false);
  const navigate = useNavigationStore((s) => s.navigate);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBgUrl(data.background_image || '');
        setShowSidebar(data.admin_bg_show_sidebar === 'true');
        setShowGlass(data.admin_bg_show_glass === 'true');
        setShowDim(data.admin_bg_show_dim === 'true');
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (nextUrl: string, extra: Record<string, string> = {}) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { background_image: nextUrl, ...extra },
        }),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success('Orqa fon saqlandi!');
      // Global fonni darhol yangilash
      applyBackground(nextUrl, extra);
    } catch (e) {
      toast.error('Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const applyBackground = (url: string, opts: Record<string, string> = {}) => {
    const s = showSidebar ? (opts.admin_bg_show_sidebar === 'true' ? 'on' : showSidebar ? 'on' : 'off') : 'off';
    const bg = url || (opts.background_image ?? bgUrl);
    const glass = showGlass ? (opts.admin_bg_show_glass === 'true' ? 'on' : showGlass ? 'on' : 'off') : 'off';
    const dim = showDim ? (opts.admin_bg_show_dim === 'true' ? 'on' : showDim ? 'on' : 'off') : 'off';
    window.dispatchEvent(
      new CustomEvent('admin-bg-change', {
        detail: {
          url: bg,
          sidebar: s === 'on' ? 'hidden' : 'visible',
          glass: glass === 'on' ? 'glass' : 'none',
          dim: dim === 'on' ? 'dim' : 'none',
        },
      })
    );
  };

  const handleSave = () => {
    saveSettings(bgUrl.trim(), {
      admin_bg_show_sidebar: String(showSidebar),
      admin_bg_show_glass: String(showGlass),
      admin_bg_show_dim: String(showDim),
    });
  };

  const handleRemove = () => {
    setBgUrl('');
    saveSettings('', {
      admin_bg_show_sidebar: String(showSidebar),
      admin_bg_show_glass: String(showGlass),
      admin_bg_show_dim: String(showDim),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Orqa fon</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Admin panel orqa fon rasmini o&apos;rnating yoki o&apos;zgartiring
        </p>
      </div>

      {/* Joriy fon */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-5 h-5 text-gold" />
          <h3 className="font-medium text-foreground">Orqa fon rasmi</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bg-url">Rasm URL</Label>
          <Input
            id="bg-url"
            type="text"
            placeholder="https://example.com/image.jpg"
            value={bgUrl}
            onChange={(e) => {
              setBgUrl(e.target.value);
              if (preview && e.target.value.trim()) {
                window.dispatchEvent(
                  new CustomEvent('admin-bg-change', {
                    detail: { url: e.target.value.trim(), preview: true },
                  })
                );
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Rasm havolasini kiriting (https:// bilan boshlanishi kerak). Bo&apos;sh qoldirsangiz — asosiy fon qoladi.
          </p>
        </div>

        {/* Oldindan ko'rish */}
        <div className="space-y-2">
          <Label>Oldindan ko&apos;rish</Label>
          <div className="relative h-48 rounded-xl overflow-hidden border border-glass-border bg-background">
            {bgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgUrl}
                alt="Orqa fon"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.15';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Rasm kiritilmagan
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground bg-background/60 backdrop-blur px-2 py-1 rounded">
                {bgUrl ? 'Rasm topildi' : 'Fon: default'}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPreview(!preview);
                    if (bgUrl.trim()) {
                      window.dispatchEvent(
                        new CustomEvent('admin-bg-change', {
                          detail: { url: bgUrl.trim(), preview: !preview },
                        })
                      );
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {preview ? 'Yopish' : "Ko'rish"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Variantlar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showSidebar}
              onChange={(e) => setShowSidebar(e.target.checked)}
              className="accent-gold"
            />
            Sidebarni yashirish
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showGlass}
              onChange={(e) => setShowGlass(e.target.checked)}
              className="accent-gold"
            />
            Shisha effekt
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showDim}
              onChange={(e) => setShowDim(e.target.checked)}
              className="accent-gold"
            />
            Qoraytirish
          </label>
        </div>

        {/* Tugmalar */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Saqlash
          </Button>
          <Button variant="outline" onClick={handleRemove} disabled={saving || !bgUrl}>
            <Trash2 className="w-4 h-4 mr-1" />
            Olib tashlash
          </Button>
        </div>
      </div>

      {/* Orqaga */}
      <Button variant="ghost" onClick={() => navigate('admin-dashboard')}>
        ← Orqaga
      </Button>
    </div>
  );
}
