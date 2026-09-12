import { Link, useParams } from 'react-router-dom';
import { ColorPicker } from '../components/ColorPicker';
import { OTPGenerator } from '../components/OTPGenerator';
import { EventRSVP } from '../components/EventRSVP';
import { MoodBoard } from '../components/MoodBoard';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import { practiceLabs } from '../data/practice';
import NotFoundPage from './NotFoundPage';
import './PracticePage.css';

const components = { 'color-picker': ColorPicker, 'otp-generator': OTPGenerator, 'event-rsvp': EventRSVP, 'mood-board': MoodBoard };
export default function PracticeLabPage() {
  const { labId } = useParams();
  const { lang } = useLanguage();
  const lab = practiceLabs.find(item => item.id === labId && item.group === 'react');
  if (!lab) return <NotFoundPage />;
  const Component = components[lab.id];
  return (
    <section className="practice">
      <PageMeta title={`${lab.title} — Aleksei Lopatin`} description={lab.description[lang]} />
      <header className="practice-header">
        <p className="practice-eyebrow">Practice / {lab.technique}</p>
        <h1>{lab.title}</h1>
        <p>{lab.description[lang]}</p>
        <Link className="practice-back" to="/practice">{lang === 'ru' ? '← Назад к практике' : '← Back to Practice'}</Link>
      </header>
      <div className="practice-lab-content"><Component /></div>
    </section>
  );
}
