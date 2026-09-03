import { useLanguage } from '../i18n/LanguageContext';
import './About.css';

/* Стек сгруппирован так же, как в профиле на GitHub,
   чтобы резюме и сайт не расходились. */
const stack = [
  {
    id: 'languages',
    items: ['TypeScript', 'Python', 'JavaScript', 'SQL', 'HTML', 'CSS'],
  },
  {
    id: 'frameworks',
    items: ['React', 'Next.js', 'FastAPI', 'Django', 'Node.js', 'Tailwind'],
  },
  {
    id: 'tools',
    items: ['PostgreSQL', 'Supabase', 'Vercel', 'Railway', 'Git', 'Vite'],
  },
];

export function About() {
  const { t } = useLanguage();

  return (
    <section className="about" id="about">
      <h2 className="about-heading">{t('about.heading')}</h2>

      <div className="about-body">
        <p className="about-lead">{t('about.lead')}</p>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p className="about-open">{t('about.open')}</p>
      </div>

      <div className="about-stack">
        {stack.map(({ id, items }) => (
          <div className="about-stack-group" key={id}>
            <h3>{t(`about.stack.${id}`)}</h3>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;
