import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PracticePage } from './pages/PracticePage';
import { CurrencyPage } from './pages/CurrencyPage';
import { GamesPage } from './pages/GamesPage';
import { TicTacToePage } from './pages/TicTacToePage';
import { StopwatchPage } from './pages/StopwatchPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <div className="app" id="top">
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/currency" element={<CurrencyPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/tic-tac-toe" element={<TicTacToePage />} />
          <Route path="/stopwatch" element={<StopwatchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
