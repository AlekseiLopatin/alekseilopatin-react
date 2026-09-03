import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeContext';
import { LanguageProvider } from '../i18n/LanguageContext';

/* Почти каждый компонент читает язык, тему или роутер,
   поэтому оборачиваем их один раз здесь, а не в каждом тесте. */
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <LanguageProvider>{ui}</LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

export * from '@testing-library/react';
