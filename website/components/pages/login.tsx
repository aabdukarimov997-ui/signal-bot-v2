'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { GlassCard } from '@/components/shared/glass-card';
import { useNavigationStore, useAuthStore } from '@/store';
import { TELEGRAM } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email kiritilishi shart');
      return;
    }
    if (!password.trim()) {
      setError('Parol kiritilishi shart');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Kirishda xatolik yuz berdi');
      }

      const data = await res.json();
      const user = data.user || data;

      login({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      toast.success(`Xush kelibsiz, ${user.name}!`);
      navigate('dashboard');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Noma\'lum xatolik yuz berdi';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(192,192,192,0.05)_0%,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <GlassCard glow className="p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
              Tizimga Kirish
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hisobingizga kiring
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-foreground/80 text-sm">
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={!!error}
                autoComplete="email"
                className="bg-glass border-glass-border h-11"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground/80 text-sm">
                Parol
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={!!error}
                  autoComplete="current-password"
                  className="bg-glass border-glass-border h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kirilmoqda...
                </span>
              ) : (
                'Kirish'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0a0a09] text-muted-foreground">yoki</span>
            </div>
          </div>

          {/* Telegram Login */}
          <a
            href={TELEGRAM.BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-silver/20 bg-glass text-foreground font-medium text-sm hover:bg-glass-strong transition-colors duration-200"
          >
            <Send className="w-4 h-4 text-silver" />
            Telegram orqali kirish
          </a>

          {/* Demo hint */}
          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            Demo:{' '}
            <span className="text-muted-foreground/80 font-mono text-[11px]">
              admin@aaa-trading.academy / aaa2024
            </span>
          </p>
        </GlassCard>
      </motion.div>
    </main>
  );
}