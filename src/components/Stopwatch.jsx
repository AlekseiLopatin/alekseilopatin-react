import { useEffect, useRef, useState } from 'react';
import { Gecko } from './Gecko';
import './Stopwatch.css';

const pad = (n) => String(n).padStart(2, '0');

const formatStopwatch = (ms) => {
  const cs = Math.floor((ms % 1000) / 10);
  const totalSeconds = Math.floor(ms / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
};

const formatTimer = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const PRESETS = [1, 5, 15, 30, 60];

/* Оба режима смонтированы всегда, переключение только прячет
   неактивный через hidden. Условный рендер (mode === X ? A : B)
   размонтировал бы неактивный режим и сбрасывал его состояние —
   запущенный секундомер обнулялся бы при уходе на вкладку Timer
   и обратно, а в оригинальной ванильной версии оба блока жили
   в DOM постоянно и просто скрывались через display:none. */
const StopwatchMode = ({ hidden, onRunningChange }) => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
  /* Отсчёт от Date.now(), а не накопление по 10мс тику —
     иначе задержки таймера браузера постепенно уводят время. */
  const startRef = useRef(0);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(baseRef.current + (Date.now() - startRef.current));
    }, 10);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    onRunningChange(running);
  }, [running, onRunningChange]);

  const toggle = () => {
    if (running) {
      baseRef.current = elapsed;
      setRunning(false);
    } else {
      startRef.current = Date.now();
      setRunning(true);
    }
  };

  const reset = () => {
    if (elapsed > 0) {
      setHistory((prev) => [formatStopwatch(elapsed), ...prev]);
    }
    setRunning(false);
    baseRef.current = 0;
    setElapsed(0);
  };

  return (
    <div className="stopwatch-panel" hidden={hidden}>
      <p className="stopwatch-display">{formatStopwatch(elapsed)}</p>

      <div className="stopwatch-controls">
        <button type="button" className="stopwatch-primary" onClick={toggle}>
          {running ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}
        </button>
        <button
          type="button"
          className="stopwatch-secondary"
          onClick={reset}
          disabled={elapsed === 0 && !running}
        >
          Reset
        </button>
      </div>

      {history.length > 0 && (
        <div className="stopwatch-history">
          <h3>History</h3>
          <ul>
            {history.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const TimerMode = ({ hidden, onRunningChange }) => {
  const [duration, setDuration] = useState(15 * 60 * 1000);
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const endRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = endRef.current - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    onRunningChange(running);
  }, [running, onRunningChange]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    if (remaining <= 0) return;
    endRef.current = Date.now() + remaining;
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  const applyPreset = (minutes) => {
    const ms = minutes * 60 * 1000;
    setDuration(ms);
    setRemaining(ms);
    setRunning(false);
  };

  const applyCustom = () => {
    const minutes = Number(customMinutes);
    if (minutes > 0) {
      applyPreset(minutes);
      setCustomMinutes('');
    }
  };

  const isDone = !running && remaining === 0;

  return (
    <div className="stopwatch-panel" hidden={hidden}>
      <p className="stopwatch-display">{formatTimer(remaining)}</p>
      {/* aria-live только тут: секундомер тикает 100 раз в секунду
         и заспамил бы скринридер, а "время вышло" — разовое событие. */}
      <p className="timer-status" aria-live="polite">
        {isDone ? "Time's up!" : ''}
      </p>

      <div className="stopwatch-controls">
        <button
          type="button"
          className="stopwatch-primary"
          onClick={toggle}
          disabled={remaining <= 0}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button type="button" className="stopwatch-secondary" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="timer-presets">
        {PRESETS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className="timer-preset"
            onClick={() => applyPreset(minutes)}
          >
            {minutes} min
          </button>
        ))}
      </div>

      <div className="timer-custom">
        <input
          type="number"
          min="1"
          placeholder="Custom (min)"
          value={customMinutes}
          onChange={(event) => setCustomMinutes(event.target.value)}
        />
        <button type="button" onClick={applyCustom}>
          Set
        </button>
      </div>
    </div>
  );
};

export const Stopwatch = () => {
  const [mode, setMode] = useState('stopwatch');
  /* Активен, если тикает ЛЮБОЙ из режимов — оба смонтированы
     постоянно, поэтому секундомер может идти в фоне, пока открыта
     вкладка Timer, и геккон должен это учитывать. */
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  return (
    <div className="stopwatch">
      <div className="stopwatch-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'stopwatch'}
          className={mode === 'stopwatch' ? 'stopwatch-tab is-active' : 'stopwatch-tab'}
          onClick={() => setMode('stopwatch')}
        >
          Stopwatch
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'timer'}
          className={mode === 'timer' ? 'stopwatch-tab is-active' : 'stopwatch-tab'}
          onClick={() => setMode('timer')}
        >
          Timer
        </button>
      </div>

      <StopwatchMode hidden={mode !== 'stopwatch'} onRunningChange={setStopwatchRunning} />
      <TimerMode hidden={mode !== 'timer'} onRunningChange={setTimerRunning} />

      <Gecko active={stopwatchRunning || timerRunning} />
    </div>
  );
};

export default Stopwatch;
