'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, HelpCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { TELEGRAM } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ContactMethod {
  title: string;
  description: string;
  icon: typeof Send;
  href: string;
  external?: boolean;
}

const contactMethods: ContactMethod[] = [
  {
    title: 'Telegram',
    description: 'Bot orqali tez bog\'lanish',
    icon: Send,
    href: TELEGRAM.BOT,
    external: true,
  },
  {
    title: 'Kanal',
    description: 'Yangiliklar va e\'lonlar',
    icon: MessageSquare,
    href: TELEGRAM.MARKETING_CHANNEL,
    external: true,
  },
  {
    title: 'Yordam',
    description: TELEGRAM.HELP,
    icon: HelpCircle,
    href: `https://t.me/${TELEGRAM.HELP.replace('@', '')}`,
    external: true,
  },
];

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Ism kiritilishi shart';
  }

  if (!data.email.trim()) {
    errors.email = 'Email kiritilishi shart';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Noto\'g\'ri email format';
  }

  if (!data.subject.trim()) {
    errors.subject = 'Mavzu kiritilishi shart';
  }

  if (!data.message.trim()) {
    errors.message = 'Xabar kiritilishi shart';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Xabar kamida 10 ta belgidan iborat bo\'lishi kerak';
  }

  return errors;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Xatolik yuz berdi');

      toast.success("Xabaringiz muvaffaqiyatli yuborildi!");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch {
      toast.error("Xabarni yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(192,192,192,0.04)_0%,transparent_70%)]" />
        </div>

        <AnimatedSection className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gradient"
          >
            Aloqa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Biz bilan bog&apos;lanish uchun quyidagi usullardan foydalaning
          </motion.p>
        </AnimatedSection>
      </section>

      {/* ── Contact Methods ── */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <GlassCard
                  key={method.title}
                  hover
                  index={i}
                  className="p-6 text-center group"
                >
                  <a
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-14 h-14 rounded-xl bg-silver/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-silver/15 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-silver" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-xs text-silver/60 group-hover:text-silver transition-colors">
                      Ochish
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact Form ── */}
      <section className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <SectionHeading
            title="Xabar Yuborish"
            subtitle="Savollaringiz yoki takliflaringiz bo'lsa, shaklni to'ldiring"
          />

          <AnimatedSection delay={0.1}>
            <GlassCard glow className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-foreground/80 text-sm">
                    Ism
                  </Label>
                  <Input
                    id="contact-name"
                    name="name"
                    placeholder="Ismingizni kiriting"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={!!errors.name}
                    className="bg-glass border-glass-border h-11"
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-foreground/80 text-sm">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    className="bg-glass border-glass-border h-11"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="contact-subject" className="text-foreground/80 text-sm">
                    Mavzu
                  </Label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    placeholder="Xabar mavzusi"
                    value={formData.subject}
                    onChange={handleChange}
                    aria-invalid={!!errors.subject}
                    className="bg-glass border-glass-border h-11"
                  />
                  {errors.subject && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive"
                    >
                      {errors.subject}
                    </motion.p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-foreground/80 text-sm">
                    Xabar
                  </Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Xabaringizni yozing..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={!!errors.message}
                    className="bg-glass border-glass-border min-h-[120px] resize-none"
                  />
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-destructive"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      Yuborilmoqda...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Yuborish
                    </span>
                  )}
                </Button>
              </form>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Social Links ── */}
      <section className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                Ijtimoiy Tarmoqlar
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={TELEGRAM.MARKETING_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-glass border border-glass-border text-sm text-foreground/80 hover:text-foreground hover:bg-glass-strong transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4 text-silver" />
                  Telegram Kanal
                  <ExternalLink className="w-3 h-3 text-silver/50" />
                </a>
                <a
                  href={TELEGRAM.BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-glass border border-glass-border text-sm text-foreground/80 hover:text-foreground hover:bg-glass-strong transition-colors duration-200"
                >
                  <Send className="w-4 h-4 text-silver" />
                  Telegram Bot
                  <ExternalLink className="w-3 h-3 text-silver/50" />
                </a>
                <a
                  href={`https://t.me/${TELEGRAM.HELP.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-glass border border-glass-border text-sm text-foreground/80 hover:text-foreground hover:bg-glass-strong transition-colors duration-200"
                >
                  <HelpCircle className="w-4 h-4 text-silver" />
                  Yordam
                  <ExternalLink className="w-3 h-3 text-silver/50" />
                </a>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-8" />
    </main>
  );
}