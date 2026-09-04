import { Link } from 'react-router-dom';
import { Stopwatch } from '../components/Stopwatch';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './PracticePage.css';

export const StopwatchPage = () => {
  const { t } = useLanguage();

  return (
    <section className="practice">
      <PageMeta
        title={t('meta.stopwatch.title')}
        description={t('meta.stopwatch.desc')}
      />
      <header className="practice-header">
        <h1>{t('stopwatch.heading')}</h1>
        <p>{t('stopwatch.intro')}</p>
        <Link className="practice-back" to="/games">
          {t('games.back')}
        </Link>
      </header>

      <Stopwatch />
    </section>
  );
};

export default StopwatchPage;
