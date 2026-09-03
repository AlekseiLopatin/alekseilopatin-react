import { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
  { id: 'ember', label: 'Ember', icon: '🔥' },
  { id: 'daylight', label: 'Daylight', icon: '☀️' },
  { id: 'twilight', label: 'Twilight', icon: '🌙' },
];

const STORAGE_KEY = 'al-theme';
const DEFAULT_THEME = 'ember';

const ThemeContext = createContext(null);

/* localStorage кидает SecurityError, если у пользователя запрещены
   данные сайтов — без try/catch это уронило бы всё приложение. */
function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((t) => t.id === stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* тема просто не переживёт перезагрузку — не повод падать */
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storeTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return context;
}
