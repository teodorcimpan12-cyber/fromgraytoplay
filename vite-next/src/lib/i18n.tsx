import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import ro from '../translations/ro.json';
import en from '../translations/en.json';
import hu from '../translations/hu.json';

export type Lang = 'ro' | 'en' | 'hu';

export const translations = { ro, en, hu } as const;

export const langNames: Record<Lang, string> = {
  ro: 'Română',
  en: 'English',
  hu: 'Magyar',
};

export const langFlags: Record<Lang, string> = {
  ro: 'RO',
  en: 'EN',
  hu: 'HU',
};

const STORAGE_KEY = 'fgtp-lang';

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'ro';
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && stored in translations) return stored;
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('hu')) return 'hu';
  if (browser.startsWith('ro')) return 'ro';
  return 'en';
}

type Dict = Record<string, unknown>;

function lookup(dict: Dict, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Dict)) {
      cur = (cur as Dict)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(() => {
    const dict = translations[lang] as Dict;
    const fallback = translations.en as Dict;
    return {
      lang,
      setLang: setLangState,
      t: (key, vars) => {
        let s = lookup(dict, key) ?? lookup(fallback, key) ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
          }
        }
        return s;
      },
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
