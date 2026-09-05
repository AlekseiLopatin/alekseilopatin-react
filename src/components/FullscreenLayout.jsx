import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import './FullscreenLayout.css';

/* Секундомер и колесо рандома — самодостаточные "приложения", каждое
   уже верстается под 100% высоты сцены (см. .wheel-app и .stopwatch).
   Навбар и футер тут только отнимали бы место и заставляли страницу
   скроллиться, поэтому эти два маршрута монтируются без общего шасси
   сайта — только тонкая полоса с кнопкой "назад". */
export const FullscreenLayout = ({ backTo = '/games', title }) => {
  const { t } = useLanguage();

  return (
    <div className="fullscreen-page">
      <div className="fullscreen-bar">
        <Link className="fullscreen-back" to={backTo}>
          {t('games.back')}
        </Link>
        {/* Заголовок страницы нужен ради доступности (одна h1 на
            страницу), но не везде: у колеса своя h1 уже внутри
            wheel-header, вторую туда добавлять не нужно. */}
        {title && <h1 className="fullscreen-title">{title}</h1>}
      </div>
      <div className="fullscreen-content">
        <Outlet />
      </div>
    </div>
  );
};

export default FullscreenLayout;
