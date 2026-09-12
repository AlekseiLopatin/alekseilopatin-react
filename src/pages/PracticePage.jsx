import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import { practiceGroups, practiceLabs } from '../data/practice';
import './PracticePage.css';

export const PracticePage = () => {
  const { lang, t } = useLanguage();
  const open = lang === 'ru' ? 'Открыть лабораторную' : 'Open lab';
  return (
    <section className="practice">
      <PageMeta title={t('meta.practice.title')} description={t('meta.practice.desc')} />
      <header className="practice-header">
        <p className="practice-eyebrow">FreeCodeCamp · {lang === 'ru' ? 'Коллекция упражнений' : 'Exercise collection'}</p>
        <h1>{t('practice.heading')}</h1>
        <p>{lang === 'ru' ? 'Небольшие эксперименты с интерфейсами. Выбери лабораторную — у каждой своя страница.' : 'Small experiments with interfaces. Choose a lab — each has its own page.'}</p>
        <Link className="practice-back" to="/">{t('practice.back')}</Link>
      </header>
      {practiceGroups.map(group => (
        <section className="practice-group" key={group.id} aria-labelledby={`group-${group.id}`}>
          <header className="practice-group-header">
            <h2 id={`group-${group.id}`}>{group.title[lang]}</h2>
            <span>{String(practiceLabs.filter(lab => lab.group === group.id).length).padStart(2, '0')}</span>
          </header>
          <div className="practice-grid">
            {practiceLabs.filter(lab => lab.group === group.id).map(lab => (
              <article className="practice-card" key={lab.id}>
                <p className="practice-eyebrow">{lab.technique}</p>
                <h3>{lab.title}</h3>
                <p className="practice-description">{lab.description[lang]}</p>
                {lab.href ? (
                  <a className="practice-lab-link" href={lab.href} aria-label={`${open}: ${lab.title}`}>{open}<span aria-hidden="true">↗</span></a>
                ) : (
                  <Link className="practice-lab-link" to={`/practice/${lab.id}`} aria-label={`${open}: ${lab.title}`}>{open}<span aria-hidden="true">↗</span></Link>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
};
export default PracticePage;
