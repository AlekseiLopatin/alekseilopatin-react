import { Link } from 'react-router-dom';
import { games } from '../data/games';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './GamesPage.css';

/* kind решает, каким тегом рендерить карточку:
   - "react" -> <Link>, переход без перезагрузки
   - "static"/"external" -> <a>, полная навигация (это не React-код) */
const GameCard = ({ title, description, href, kind, tags }) => {
  const { lang } = useLanguage();
  const isExternal = kind === 'external';

  const content = (
    <>
      <h3 className="game-card-title">{title}</h3>
      <p className="game-card-desc">{description[lang]}</p>
      <ul className="game-card-tags">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </>
  );

  if (kind === 'react') {
    return (
      <Link className="game-card" to={href}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className="game-card"
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {content}
    </a>
  );
};

export const GamesPage = () => {
  const { t } = useLanguage();

  return (
    <section className="games-page">
      <PageMeta title={t('meta.games.title')} description={t('meta.games.desc')} />

      <header className="practice-header">
        <h1>{t('games.heading')}</h1>
        <p>{t('games.intro')}</p>
        <Link className="practice-back" to="/">
          {t('practice.back')}
        </Link>
      </header>

      <div className="games-grid">
        {games.map((game) => (
          <GameCard key={game.id} {...game} />
        ))}
      </div>
    </section>
  );
};

export default GamesPage;
