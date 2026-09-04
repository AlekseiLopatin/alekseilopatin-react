import { Link } from 'react-router-dom';
import { Board } from '../components/TicTacToe';
import { PageMeta } from '../components/PageMeta';
import { useLanguage } from '../i18n/LanguageContext';
import './PracticePage.css';

export const TicTacToePage = () => {
  const { t } = useLanguage();

  return (
    <section className="practice">
      <PageMeta
        title={t('meta.ticTacToe.title')}
        description={t('meta.ticTacToe.desc')}
      />
      <header className="practice-header">
        <h1>{t('ticTacToe.heading')}</h1>
        <p>{t('ticTacToe.intro')}</p>
        <Link className="practice-back" to="/games">
          {t('games.back')}
        </Link>
      </header>

      <Board />
    </section>
  );
};

export default TicTacToePage;
