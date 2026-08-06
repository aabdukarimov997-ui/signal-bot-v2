'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FloatingTelegram } from '@/components/layout/floating-telegram';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { PatternBorder, SidePattern } from '@/components/shared/oriental-pattern';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Admin sahifalari: Navbar/Footer/bezaklarsiz — faqat kontent
  if (isAdmin) {
    return (
      <main className="min-h-screen bg-background">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden 2xl:block w-9">
        <SidePattern className="h-full" />
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden 2xl:block w-9">
        <SidePattern className="h-full -scale-x-100" />
      </div>
      <main className="min-h-screen pt-16">
        <PatternBorder className="relative z-10" />
        <ErrorBoundary>{children}</ErrorBoundary>
        <PatternBorder className="relative z-10 rotate-180 -mt-px" />
      </main>
      <Footer />
      <FloatingTelegram />
    </>
  );
}
