import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { ChromeLayout } from './components/ChromeLayout';
import { FullscreenLayout } from './components/FullscreenLayout';
import { useLanguage } from './i18n/LanguageContext';
import './App.css';

/* Каждая страница — свой чанк: при первой загрузке грузится только
   код главной, а не всё сразу (валютный конвертер, колесо и т.д.
   подтягиваются по факту перехода на них). */
const HomePage = lazy(() => import('./pages/HomePage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const CurrencyPage = lazy(() => import('./pages/CurrencyPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const TicTacToePage = lazy(() => import('./pages/TicTacToePage'));
const StopwatchPage = lazy(() => import('./pages/StopwatchPage'));
const WheelPage = lazy(() => import('./pages/WheelPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { t } = useLanguage();

  return (
    <div className="app" id="top">
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route element={<ChromeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/currency" element={<CurrencyPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/tic-tac-toe" element={<TicTacToePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Секундомер и колесо — без навбара/футера, на один экран
              без скролла, только кнопка "назад" (см. FullscreenLayout). */}
          <Route
            element={<FullscreenLayout backTo="/games" title={t('stopwatch.heading')} />}
          >
            <Route path="/stopwatch" element={<StopwatchPage />} />
          </Route>
          <Route element={<FullscreenLayout backTo="/games" />}>
            <Route path="/games/wheel" element={<WheelPage />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
