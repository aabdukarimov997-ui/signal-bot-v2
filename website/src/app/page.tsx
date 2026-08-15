'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/store';
import HomePage from '@/components/pages/home';
import CoursePage from '@/components/pages/course';
import SignalsPage from '@/components/pages/signals';
import VipPage from '@/components/pages/vip';
import MarketPage from '@/components/pages/market';
import BlogPage from '@/components/pages/blog';
import FAQPage from '@/components/pages/faq';
import AboutPage from '@/components/pages/about';
import ContactPage from '@/components/pages/contact';
import DashboardPage from '@/components/pages/dashboard';
import PayPage from '@/components/pages/pay';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

function PageRouter() {
  const currentPage = useNavigationStore((s) => s.currentPage);

  // Hash-routing: #/vip, #/course, #/pay/signal, ... — har bir sahifa o'z linkiga ega
  useEffect(() => {
    const applyHash = useNavigationStore.getState().applyHash;
    applyHash(window.location.hash);
    const onHashChange = () => {
      useNavigationStore.getState().applyHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Admin panel va login faqat /admin manzilida — asosiy saytda ularni /admin'ga yo'naltiramiz
  useEffect(() => {
    if (currentPage === 'login' || currentPage.startsWith('admin-')) {
      window.location.href = '/admin';
    }
  }, [currentPage]);

  const pages: Record<string, React.ComponentType> = {
    home: HomePage,
    course: CoursePage,
    signals: SignalsPage,
    vip: VipPage,
    market: MarketPage,
    blog: BlogPage,
    faq: FAQPage,
    about: AboutPage,
    contact: ContactPage,
    dashboard: DashboardPage,
    pay: PayPage,
  };

  const PageComponent = pages[currentPage] || HomePage;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <PageComponent />
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  return <PageRouter />;
}