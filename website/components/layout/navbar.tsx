'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Send,
  LogIn,
  LayoutDashboard,
  Shield,
  Home,
  GraduationCap,
  Activity,
  Crown,
  BarChart3,
  Newspaper,
  HelpCircle,
  Info,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useAuthStore, useUIStore } from '@/store';
import { NAV_ITEMS, TELEGRAM } from '@/lib/constants';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  GraduationCap,
  Activity,
  Crown,
  BarChart3,
  Newspaper,
  HelpCircle,
  Info,
  Mail,
};

interface LoadingScreenProps {
  className?: string;
}

export function Navbar({ className }: LoadingScreenProps) {
  const { currentPage, navigate } = useNavigationStore();
  const { user } = useAuthStore();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'glass',
        className
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo size="sm" />

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium transition-colors rounded-md',
                  isActive
                    ? 'text-emerald'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {Icon && <Icon className="size-3.5" />}
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-md bg-emerald/10 border border-emerald/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('dashboard')}
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="size-4 mr-1.5" />
                Dashboard
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('admin-users')}
                  className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
                >
                  <Shield className="size-4 mr-1.5" />
                  Admin
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('login')}
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            >
              <LogIn className="size-4 mr-1.5" />
              Login
            </Button>
          )}

          {/* Telegram Button */}
          <a
            href={TELEGRAM.BOT}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-silver transition-colors hover:bg-white/5"
            aria-label="Telegram Bot"
          >
            <Send className="size-4" />
          </a>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-muted-foreground hover:text-foreground"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 bg-[#0a0a09]/95 backdrop-blur-xl border-glass-border p-0"
            >
              <SheetHeader className="p-6 pb-4">
                <SheetTitle className="flex items-center gap-3 text-foreground">
                  <Logo size="sm" />
                  <span className="text-gradient text-lg font-bold">AAA</span>
                </SheetTitle>
              </SheetHeader>

              <Separator className="bg-glass-border" />

              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white/5 text-silver'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                      )}
                    >
                      {Icon && <Icon className="size-4 shrink-0" />}
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <Separator className="bg-glass-border" />

              <div className="p-4 space-y-2">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigate('dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LayoutDashboard className="size-4 mr-2" />
                      Dashboard
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          navigate('admin-users');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Shield className="size-4 mr-2" />
                        Admin Panel
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      navigate('login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="size-4 mr-2" />
                    Login
                  </Button>
                )}

                <a
                  href={TELEGRAM.BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
                >
                  <Send className="size-4 shrink-0" />
                  Telegram Bot
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}