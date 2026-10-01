import { useLanguage } from '../i18n/LanguageContext';
import './DeveloperIntro.css';

export function DeveloperIntro() {
  const { t } = useLanguage();
  return (
    <section className="developer-intro" aria-labelledby="developer-name">
      <p className="developer-role">{t('hero.role')}</p>
      <h1 id="developer-name">{t('hero.name')}</h1>
      <p className="developer-stack">React · Next.js · TypeScript · Python · FastAPI · PostgreSQL</p>
      <p className="developer-summary">{t('hero.intro')}</p>
      <div className="developer-actions">
        <a href="#projects">{t('hero.projects')}</a>
        <a href="https://github.com/AlekseiLopatin" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="#contact">{t('hero.contact')}</a>
      </div>
    </section>
  );
}
