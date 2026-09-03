import { Link, useLocation } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  return (
    <section className="not-found">
      <PageMeta
        title={t('meta.notFound.title')}
        description={t('meta.notFound.desc')}
      />
      <p className="not-found-code">404</p>
      <h1>{t('notFound.heading')}</h1>
      <p className="not-found-text">{t('notFound.text')}</p>

      {/* Показываем сам адрес: чаще всего это опечатка,
          и человек сразу видит, где именно ошибся. */}
      <p className="not-found-path">{pathname}</p>

      <div className="not-found-links">
        <Link className="not-found-primary" to="/">
          {t('notFound.home')}
        </Link>
        <a
          href="https://legacy.alekseilopatin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('notFound.legacy')}
        </a>
      </div>
    </section>
  );
};

export default NotFoundPage;
