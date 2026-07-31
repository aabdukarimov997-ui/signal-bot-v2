'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';
import { useNavigationStore } from '@/store';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

function extractCategory(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('trading') || lower.includes('savdo'))
    return 'Trading';
  if (lower.includes('bitcoin') || lower.includes('btc')) return 'Bitcoin';
  if (lower.includes('signal')) return 'Signal';
  if (lower.includes('market') || lower.includes('bozor')) return 'Market';
  if (lower.includes('defi')) return 'DeFi';
  if (lower.includes('nft')) return 'NFT';
  if (lower.includes('solana') || lower.includes('sol')) return 'Solana';
  if (lower.includes('ethereum') || lower.includes('eth')) return 'Ethereum';
  return 'Trading';
}

function renderContent(content: string) {
  return content.split('\n').filter(Boolean).map((para, i) => (
    <p key={i} className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-5">
      {para}
    </p>
  ));
}

export default function BlogDetailPage() {
  const { blogPostSlug, navigate, goBack } = useNavigationStore();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!blogPostSlug) {
      setError('Post topilmadi');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog?slug=${encodeURIComponent(blogPostSlug)}`);
      if (!res.ok) {
        throw new Error('Maqola topilmadi');
      }
      const data: BlogPostDetail = await res.json();
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noma'lum xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [blogPostSlug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const category = post ? extractCategory(post.content || post.title) : 'Trading';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-8"
          >
            <button
              onClick={() => goBack()}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Blogga qaytish
            </button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Loading */}
          {isLoading && (
            <GlassCard className="p-0 overflow-hidden">
              <Skeleton className="h-[260px] w-full rounded-none" />
              <div className="p-6 sm:p-10 flex flex-col gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-2/3" />
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Error */}
          {!isLoading && error && (
            <AnimatedSection>
              <GlassCard className="max-w-lg mx-auto text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Xatolik yuz berdi
                    </h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('blog')} className="gap-2 border-gold/20 text-gold hover:text-foreground">
                      <ArrowLeft className="w-4 h-4" />
                      Blogga qaytish
                    </Button>
                    <Button variant="outline" onClick={fetchPost} className="gap-2 border-gold/20 text-gold hover:text-foreground">
                      <Loader2 className="w-4 h-4" />
                      Qayta urinish
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          )}

          {/* Post */}
          {!isLoading && !error && post && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <GlassCard glowGold className="p-0 overflow-hidden">
                {post.coverImage ? (
                  <div className="relative h-[240px] sm:h-[380px]">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute top-5 left-5">
                      <Badge variant="outline" className="glass text-xs border-gold/20 text-gold">
                        {category}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-[200px] sm:h-[280px] bg-gradient-to-br from-gold/10 via-gold/5 to-transparent flex items-center justify-center">
                    <Newspaper className="w-20 h-20 text-gold/20" />
                    <div className="absolute top-5 left-5">
                      <Badge variant="outline" className="glass text-xs border-gold/20 text-gold">
                        {category}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-10">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-5">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.createdAt)}
                    </span>
                    {post.author?.name && (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {post.author.name}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-base sm:text-lg text-gold/90 leading-relaxed mb-8 border-l-2 border-gold/30 pl-4">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="pt-2">
                    {renderContent(post.content)}
                  </div>
                </div>
              </GlassCard>

              {/* Back CTA */}
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => navigate('blog')}
                  variant="outline"
                  className="gap-2 border-gold/20 text-gold hover:bg-gold/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Barcha maqolalar
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
