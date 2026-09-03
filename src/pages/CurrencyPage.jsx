import { Link } from 'react-router-dom';
import { CurrencyConverter } from '../components/CurrencyConverter';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './PracticePage.css';

export const CurrencyPage = () => {
  const { t } = useLanguage();

  return (
    <section className="practice">
      <PageMeta
        title={t('meta.currency.title')}
        description={t('meta.currency.desc')}
      />
      <header className="practice-header">
        <h1>{t('currency.heading')}</h1>
        <p>{t('currency.intro')}</p>
        <Link className="practice-back" to="/">
          {t('practice.back')}
        </Link>
      </header>

      <CurrencyConverter />
    </section>
  );
};

export default CurrencyPage;
