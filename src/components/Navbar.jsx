import { useState } from 'react';
import { Link } from 'react-router-dom';
import { THEMES, useTheme } from '../theme/ThemeContext';
import { LANGUAGES, useLanguage } from '../i18n/LanguageContext';
import './Navbar.css';

/* Один источник правды для ссылок: новая страница = одна строка здесь.
   to — маршрут роутера, hash — якорь внутри главной. */
export const navLinks = [
  { id: 'projects', labelKey: 'nav.projects', to: '/' },
  { id: 'about', labelKey: 'nav.about', to: '/#about' },
  { id: 'contact', labelKey: 'nav.contact', to: '/#contact' },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="switcher" role="group" aria-label={t('nav.theme')}>
      {THEMES.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className="switcher-button"
          onClick={() => setTheme(id)}
          aria-pressed={theme === id}
          title={label}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="visually-hidden">{label}</span>
        </button>
      ))}
    </div>
  );
}

function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="switcher" role="group" aria-label={t('nav.language')}>
      {LANGUAGES.map(({ id, label, short }) => (
        <button
          key={id}
          type="button"
          className="switcher-button"
          onClick={() => setLang(id)}
          aria-pressed={lang === id}
          title={label}
        >
          <span aria-hidden="true">{short}</span>
          <span className="visually-hidden">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="navbar">
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>

      <div className="navbar-inner">
        <Link className="navbar-brand" to="/">
          Aleksei&nbsp;Lopatin
        </Link>

        <button
          type="button"
          className="navbar-burger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="navbar-menu"
        >
          <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
          <span className="visually-hidden">{t('nav.menu')}</span>
        </button>

        <div
          id="navbar-menu"
          className={isOpen ? 'navbar-menu is-open' : 'navbar-menu'}
        >
          <nav aria-label={t('nav.mainNav')}>
            <ul className="navbar-links">
              {navLinks.map(({ id, labelKey, to }) => (
                <li key={id}>
                  <Link to={to} onClick={() => setIsOpen(false)}>
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
