import { Link } from 'react-router-dom';
import { WheelOfNames } from '../components/wheel/WheelOfNames';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './PracticePage.css';

export const WheelPage = () => {
  const { t } = useLanguage();

  return (
    <section className="practice">
      <PageMeta title={t('meta.wheel.title')} description={t('meta.wheel.desc')} />
      <header className="practice-header">
        <h1>{t('wheel.heading')}</h1>
        <p>{t('wheel.intro')}</p>
        <Link className="practice-back" to="/games">
          {t('games.back')}
        </Link>
      </header>

      <WheelOfNames />
    </section>
  );
};

export default WheelPage;
