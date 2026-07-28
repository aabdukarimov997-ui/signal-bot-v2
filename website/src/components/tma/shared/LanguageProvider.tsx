'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Lang, t as translate } from '@/lib/tma/i18n';
import { useTmaStore } from '@/lib/tma/store';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'uz',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const storeLang = useTmaStore((s) => s.lang);
  const setStoreLang = useTmaStore((s) => s.setLang);
  const [lang, setLangState] = useState<Lang>('uz');

  useEffect(() => {
    // Try to get saved language
    const saved = localStorage.getItem('tma_lang') as Lang | null;
    if (saved && ['uz', 'en', 'ru'].includes(saved)) {
      setLangState(saved);
      setStoreLang(saved);
    }
  }, [setStoreLang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    setStoreLang(l);
    localStorage.setItem('tma_lang', l);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, lang, params);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
