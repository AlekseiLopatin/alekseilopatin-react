import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

export const LANGUAGES = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'ru', label: 'Русский', short: 'RU' },
];

const STORAGE_KEY = 'al-lang';
const DEFAULT_LANG = 'en';

const LanguageContext = createContext(null);

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.some((l) => l.id === stored)) return stored;
    /* Нет сохранённого выбора — берём язык браузера. */
    return navigator.language?.startsWith('ru') ? 'ru' : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* выбор не переживёт перезагрузку — не повод падать */
    }
  }, [lang]);

  /* t('nav.projects') -> строка на текущем языке.
     Если ключа нет, возвращаем сам ключ: пропажу видно сразу. */
  const t = (key) => translations[lang]?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return context;
}
