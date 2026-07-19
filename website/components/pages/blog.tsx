'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Send,
  AlertCircle,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/shared/glass-card';
import { AnimatedSection } from '@/components/shared/animated-section';
import { SectionHeading } from '@/components/shared/section-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TELEGRAM } from '@/lib/constants';

interface BlogPost {
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

function FeaturedPostCard({ post }: { post: BlogPost }) {
  const category = extractCategory(post.content || post.title);

  return (
    <GlassCard className="p-0 overflow-hidden" hover>
      <div className="relative h-[240px] sm:h-[320px]">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-silver/10 via-silver/5 to-transparent flex items-center justify-center">
            <Newspaper className="w-16 h-16 text-silver/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge
            variant="outline"
            className="glass text-xs border-silver/20 text-silver"
          >
            {category}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(post.createdAt)}</span>
            {post.author?.name && (
              <>
                <span className="text-glass-border">•</span>
                <span>{post.author.name}</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-3 line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 max-w-2xl">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function BlogPostCard({
  post,
  index,
}: {
  post: BlogPost;
  index: number;
}) {
  const category = extractCategory(post.content || post.title);

  return (
    <GlassCard key={post.id} index={index} hover className="p-0 overflow-hidden">
      <div className="relative h-[180px]">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-silver/10 via-silver/5 to-transparent flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-silver/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className="glass text-[10px] border-silver/20 text-silver"
          >
            {category}
          </Badge>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-silver hover:text-foreground transition-colors cursor-pointer group">
            O&apos;qish
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function BlogPostSkeleton() {
  return (
    <div className="glass-card p-0 overflow-hidden">
      <Skeleton className="h-[180px] w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function FeaturedPostSkeleton() {
  return (
    <div className="glass-card p-0 overflow-hidden">
      <Skeleton className="h-[240px] sm:h-[320px] w-full rounded-none" />
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) {
        throw new Error('Maqolalarni yuklashda xatolik yuz berdi');
      }
      const data: BlogPost[] = await res.json();
      setPosts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Noma\'lum xatolik yuz berdi'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-glow pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <Newspaper className="w-4 h-4 text-silver" />
              <span className="text-sm text-muted-foreground">
                Maqolalar va tahlillar
              </span>
            </div>
          </motion.div>

          <SectionHeading
            title="Blog"
            subtitle="Kripto savdo bo'yicha eng so'nggi maqolalar va tahlillar"
          />
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-8">
              <FeaturedPostSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogPostSkeleton key={i} />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
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
                  <Button
                    variant="outline"
                    onClick={fetchPosts}
                    className="gap-2 border-silver/20 text-silver hover:text-foreground"
                  >
                    <Loader2 className="w-4 h-4" />
                    Qayta urinish
                  </Button>
                </div>
              </GlassCard>
            </AnimatedSection>
          )}

          {/* Empty State */}
          {!isLoading && !error && posts.length === 0 && (
            <AnimatedSection>
              <GlassCard className="max-w-lg mx-auto text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-silver/5 border border-glass-border flex items-center justify-center">
                    <Newspaper className="w-7 h-7 text-silver/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Hali maqolalar yo&apos;q
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tez orada yangi maqolalar qo&apos;shiladi.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          )}

          {/* Blog Posts */}
          {!isLoading && !error && posts.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                {/* Featured Post */}
                {featuredPost && (
                  <AnimatedSection delay={0.05}>
                    <FeaturedPostCard post={featuredPost} />
                  </AnimatedSection>
                )}

                {/* Grid Posts */}
                {gridPosts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridPosts.map((post, i) => (
                      <BlogPostCard key={post.id} post={post} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection delay={0.1}>
            <GlassCard glow className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0088cc]/5 via-transparent to-[#0088cc]/5 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
                <div className="flex items-start gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center justify-center shrink-0">
                    <Send className="w-6 h-6 text-[#0088cc]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Yangi maqolalar va tahlillar
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Telegram kanaliga obuna bo&apos;ling va birinchilardan
                      xabardor bo&apos;ling
                    </p>
                  </div>
                </div>
                <Link href={TELEGRAM.MARKETING_CHANNEL} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white shrink-0">
                    <Send className="w-4 h-4" />
                    Telegram
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}