import { Link } from 'react-router-dom';
import { ColorPicker } from '../components/ColorPicker';
import { OTPGenerator } from '../components/OTPGenerator';
import { EventRSVP } from '../components/EventRSVP';
import { MoodBoard } from '../components/MoodBoard';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './PracticePage.css';

/* Новое упражнение = один объект здесь.
   Порядок в массиве — порядок на странице. */
const labs = [
  {
    id: 'color-picker',
    title: 'Color Picker',
    note: { en: 'useState, controlled input', ru: 'useState, контролируемый инпут' },
    Component: ColorPicker,
  },
  {
    id: 'otp-generator',
    title: 'OTP Generator',
    note: {
      en: 'useEffect, timer with cleanup',
      ru: 'useEffect, таймер с очисткой',
    },
    Component: OTPGenerator,
  },
  {
    id: 'event-rsvp',
    title: 'Event RSVP',
    note: {
      en: 'form state, one handler for all fields',
      ru: 'состояние формы, один обработчик на все поля',
    },
    Component: EventRSVP,
  },
  {
    id: 'mood-board',
    title: 'Mood Board',
    note: {
      en: 'list rendering with .map() and keys',
      ru: 'отрисовка списка через .map() и ключи',
    },
    Component: MoodBoard,
  },
];

export const PracticePage = () => {
  const { lang, t } = useLanguage();

  return (
    <section className="practice">
      <PageMeta
        title={t('meta.practice.title')}
        description={t('meta.practice.desc')}
      />
      <header className="practice-header">
        <h1>{t('practice.heading')}</h1>
        <p>{t('practice.intro')}</p>
        <Link className="practice-back" to="/">
          {t('practice.back')}
        </Link>
      </header>

      <div className="practice-grid">
        {labs.map(({ id, title, note, Component }) => (
          <article className="practice-item" key={id}>
            <header className="practice-item-header">
              <h2>{title}</h2>
              <p>{note[lang]}</p>
            </header>
            <Component />
          </article>
        ))}
      </div>
    </section>
  );
};

export default PracticePage;
