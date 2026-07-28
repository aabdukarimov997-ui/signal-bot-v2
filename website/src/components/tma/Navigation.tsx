'use client';

import { useTmaStore, type TmaPage } from '@/lib/tma/store';
import { useLang } from './shared/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

const navItems: Array<{ id: TmaPage; icon: string; labelKey: string }> = [
  { id: 'home', icon: '🏠', labelKey: 'nav_home' },
  { id: 'signals', icon: '📈', labelKey: 'nav_signals' },
  { id: 'courses', icon: '📚', labelKey: 'nav_courses' },
  { id: 'account', icon: '👤', labelKey: 'nav_account' },
  { id: 'more', icon: '⚡', labelKey: 'nav_more' },
];

const moreItems: Array<{ id: TmaPage; icon: string; labelKey: string }> = [
  { id: 'referral', icon: '👥', labelKey: 'nav_referral' },
  { id: 'social', icon: '🌐', labelKey: 'nav_social' },
  { id: 'help', icon: '☎️', labelKey: 'nav_help' },
];

export function TmaNavigation() {
  const { currentPage, navigate } = useTmaStore();
  const user = useTmaStore((s) => s.user);
  const { t } = useLang();

  const handleNav = (id: TmaPage | 'more') => {
    if (id === 'more') {
      navigate('social');
    } else {
      navigate(id);
    }
  };

  const isActive = (id: TmaPage) => {
    if (id === currentPage) return true;
    if (id === 'signals' && currentPage === 'payment') return true;
    return false;
  };

  const items = user?.isAdmin
    ? [...navItems.slice(0, 4), { id: 'admin' as TmaPage, icon: '👮', labelKey: 'admin_panel' }]
    : navItems;

  return (
    <>
      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Decorative top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4a72c]/30 to-transparent" />
        
        <div className="bg-[#0a0a09]/95 backdrop-blur-xl border-t border-[#d4a72c]/10 px-2 py-2 safe-area-bottom">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-0 transition-all duration-200 ${
                  isActive(item.id)
                    ? 'text-[#d4a72c]'
                    : 'text-[#7c7b7b] hover:text-[#c0c0c0]'
                }`}
              >
                {isActive(item.id) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#d4a72c] via-[#f0d78c] to-[#d4a72c] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] font-medium truncate max-w-full">
                  {t(item.labelKey === 'admin_panel' ? 'admin_panel' : item.labelKey)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-safe-area-bottom bg-[#0a0a09]" />
      </nav>

      {/* More menu sub-navigation */}
      {currentPage === 'social' && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="glass-strong rounded-xl p-2 border border-[#d4a72c]/15">
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    currentPage === item.id
                      ? 'bg-[#d4a72c]/10 text-[#d4a72c]'
                      : 'text-[#7c7b7b] hover:bg-[#d4a72c]/5'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
