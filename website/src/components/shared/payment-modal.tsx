'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Send, ShieldCheck, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tariff {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  starsPrice: number;
  isActive: boolean;
  productType: string;
}

type PaymentMethod = 'card' | 'visa' | 'tron_trc20' | 'bnb' | 'toncoin';

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'card', label: 'UZCARD / HUMO', icon: '💳' },
  { id: 'visa', label: 'Visa karta', icon: '💳' },
  { id: 'tron_trc20', label: 'TRON TRC20 (USDT)', icon: '🔗' },
  { id: 'bnb', label: 'BNB BEP20 (USDT)', icon: '🟡' },
  { id: 'toncoin', label: 'TON (USDT)', icon: '💎' },
];

interface SettingsMap {
  [key: string]: string;
}

function copyText(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

export default function PaymentModal({
  open,
  onOpenChange,
  productType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType: 'signal' | 'course';
}) {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [telegramId, setTelegramId] = useState('');
  const [fullName, setFullName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setTariffsLoading(true);
    setError(null);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch(`/api/tma/tariffs?type=${productType}`),
        fetch('/api/tma/settings'),
      ]);
      const tData = await tRes.json();
      const sData = await sRes.json();
      setTariffs(tData.tariffs || []);
      setSettings(sData.settings || {});
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setTariffsLoading(false);
    }
  }, [productType]);

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
      setSelectedTariff(null);
      setMethod('card');
      setTelegramId('');
      setFullName('');
      setPhotoFile(null);
      setPhotoPreview(null);
      loadData();
    }
  }, [open, loadData]);

  const paymentDetails = useMemo(() => {
    switch (method) {
      case 'visa':
        return {
          number: settings.visa_card_number || settings.card_number || '',
          holder: settings.visa_card_holder || settings.card_owner || '',
          copy: settings.visa_card_number || settings.card_number || '',
        };
      case 'tron_trc20':
        return { number: settings.ton_wallet_address || '', holder: 'TRON TRC20 (USDT)', copy: settings.ton_wallet_address || '' };
      case 'bnb':
        return { number: settings.bnb_wallet_address || '', holder: 'BNB BEP20 (USDT)', copy: settings.bnb_wallet_address || '' };
      case 'toncoin':
        return { number: settings.toncoin_wallet_address || '', holder: 'TON (USDT)', copy: settings.toncoin_wallet_address || '' };
      default:
        return { number: settings.card_number || '', holder: settings.card_owner || '', copy: settings.card_number || '' };
    }
  }, [method, settings]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Iltimos, rasm (skrinshot) yuklang');
      return;
    }
    setError(null);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setError(null);
    if (!selectedTariff) {
      setError('Tarif tanlang');
      return;
    }
    if (!telegramId.trim() || !/^\d+$/.test(telegramId.trim())) {
      setError('Telegram ID raqamini kiriting (masalan: 6194170580)');
      return;
    }
    if (!photoFile) {
      setError("To'lov skrinshotini yuklang");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      fd.append('productType', productType);
      fd.append('productId', selectedTariff.id);
      fd.append('paymentMethod', method);
      fd.append('telegramId', telegramId.trim());
      fd.append('fullName', fullName.trim() || 'Website User');

      const res = await fetch('/api/payments/website', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi');
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noma'lum xatolik");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg border-gold/20 bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient">
            {success ? '✅ To‘lov yuborildi' : productType === 'course' ? '📚 Kursga obuna' : '📈 Signalga obuna'}
          </DialogTitle>
          <DialogDescription>
            {success
              ? 'Sizning to‘lovingiz admin tasdiqlashiga yuborildi.'
              : 'Tarifni tanlang va to‘lovni amalga oshiring.'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Rahmat!</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                To‘lov skrinshotingiz adminlarga yuborildi. Tasdiqlangach, obunangiz
                faollashtiriladi va Telegram orqali xabar olasiz.
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="mt-2 bg-gold text-gold-foreground hover:bg-gold/90">
              Yopish
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── 1. Tarif tanlash ── */}
            <div>
              <Label className="text-sm text-foreground/80 mb-2 block">1. Tarifni tanlang</Label>
              {tariffsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  Tariflar yuklanmoqda...
                </div>
              ) : tariffs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hozircha tariflar mavjud emas.</p>
              ) : (
                <div className="space-y-2">
                  {tariffs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTariff(t)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                        selectedTariff?.id === t.id
                          ? 'border-gold/50 bg-gold/10'
                          : 'border-glass-border bg-white/[0.02] hover:border-gold/30'
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.durationMonths > 0 ? `${t.durationMonths} oy` : 'Doimiy'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gold">${t.price}</span>
                        {selectedTariff?.id === t.id && <Check className="w-5 h-5 text-gold" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── 2. To'lov usuli ── */}
            <div>
              <Label className="text-sm text-foreground/80 mb-2 block">2. To‘lov usulini tanlang</Label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all',
                      method === m.id
                        ? 'border-gold/50 bg-gold/10 text-foreground'
                        : 'border-glass-border bg-white/[0.02] text-muted-foreground hover:border-gold/30'
                    )}
                  >
                    <span className="text-base">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 3. To'lov ma'lumotlari ── */}
            {paymentDetails.number && (
              <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">To‘lov ma’lumotlari</Label>
                  <button
                    onClick={() => copyText(paymentDetails.copy)}
                    className="text-xs text-gold hover:text-foreground transition-colors"
                  >
                    📋 Nusxalash
                  </button>
                </div>
                <p className="text-sm font-mono text-foreground break-all select-all">{paymentDetails.number}</p>
                {paymentDetails.holder && (
                  <p className="text-xs text-muted-foreground">Qabul qiluvchi: {paymentDetails.holder}</p>
                )}
              </div>
            )}

            {/* ── 4. Telegram ID + Ism ── */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="pay-tg" className="text-sm text-foreground/80 mb-1.5 block">
                  Telegram ID (raqam) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pay-tg"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="Masalan: 6194170580"
                  className="bg-white/[0.03] border-glass-border"
                  inputMode="numeric"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Botda «👤 Hisobim» bo‘limida ID ni ko‘rasiz. Obuna shu akkauntga ulanadi.
                </p>
              </div>
              <div>
                <Label htmlFor="pay-name" className="text-sm text-foreground/80 mb-1.5 block">
                  Ismingiz (ixtiyoriy)
                </Label>
                <Input
                  id="pay-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ism Familya"
                  className="bg-white/[0.03] border-glass-border"
                />
              </div>
            </div>

            {/* ── 5. Skrinshot yuklash ── */}
            <div>
              <Label className="text-sm text-foreground/80 mb-2 block">
                To‘lov skrinshoti <span className="text-destructive">*</span>
              </Label>
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/25 bg-gold/[0.03] p-6 text-center transition-colors hover:border-gold/50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Skrinshot" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gold/60" />
                    <span className="text-sm text-muted-foreground">Skrinshotni tanlash uchun bosing</span>
                    <span className="text-xs text-muted-foreground/70">JPG, PNG — to‘lov cheki rasmi</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* ── Submit ── */}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  To‘lovni yuborish
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 justify-center text-[11px] text-muted-foreground/70">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
              To‘lov admin tomonidan tekshiriladi va tasdiqlanadi
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
