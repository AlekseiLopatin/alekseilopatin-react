import { useRef, useState } from 'react';
import { DEFAULTS, useWheelState } from './useWheelState';
import { sFanfare } from './audio';
import { irand } from './utils';
import { Confetti } from './Confetti';
import { WheelMode } from './modes/WheelMode';
import { SlotMode } from './modes/SlotMode';
import { PlinkoMode } from './modes/PlinkoMode';
import { RaceMode } from './modes/RaceMode';
import { GachaMode } from './modes/GachaMode';
import { BalloonMode } from './modes/BalloonMode';
import './wheel.css';

const MODES = {
  wheel: { icon: '🎡', label: 'Wheel', btn: 'SPIN!', Component: WheelMode },
  slot: { icon: '🎰', label: 'Slots', btn: 'PULL!', Component: SlotMode },
  plinko: { icon: '🔻', label: 'Plinko', btn: 'DROP!', Component: PlinkoMode },
  race: { icon: '🏁', label: 'Race', btn: 'GO!', Component: RaceMode },
  gacha: { icon: '🔮', label: 'Gacha', btn: 'TURN!', Component: GachaMode },
  balloon: { icon: '🎈', label: 'Balloons', btn: 'THROW!', Component: BalloonMode },
};

export const WheelOfNames = () => {
  const wheel = useWheelState();
  const { state, grade, pool } = wheel;

  const [spinning, setSpinning] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editNames, setEditNames] = useState('');

  const modeRef = useRef(null);
  const confettiRef = useRef(null);

  const startSpin = () => {
    if (spinning || pool.length === 0 || !modeRef.current) return;
    setSpinning(true);
    const winner = pool[irand(pool.length)];
    modeRef.current.spin(winner, () => {
      setSpinning(false);
      showWinner(winner);
    });
  };

  const showWinner = (name) => {
    if (state.removeOnPick && !grade.picked.includes(name)) {
      wheel.markPicked(name);
    }
    setWinnerName(name);
    sFanfare(state.muted);
    confettiRef.current?.celebrate();
  };

  const closeWinner = () => setWinnerName(null);

  const pickAgain = () => {
    setWinnerName(null);
    if (pool.length) setTimeout(startSpin, 250);
  };

  const removeWinnerFromPool = () => {
    if (winnerName && !grade.picked.includes(winnerName)) {
      wheel.markPicked(winnerName);
    }
    closeWinner();
  };

  const openPanel = () => {
    if (spinning) return;
    setEditLabel(grade.label);
    setEditNames(grade.names.join('\n'));
    setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);

  const saveEdits = () => {
    const names = editNames
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) {
      // eslint-disable-next-line no-alert
      alert('Add at least one student name.');
      return;
    }
    wheel.saveEdits(editLabel.trim() || grade.label, names);
    closePanel();
  };

  const restoreDefaults = () => {
    const d = DEFAULTS[state.current];
    setEditLabel(d.label);
    setEditNames(d.names.join('\n'));
  };

  const modeInfo = MODES[state.mode];
  const ModeComponent = modeInfo.Component;

  return (
    <div className="wheel-app">
      <header className="wheel-header">
        <h1 className="wheel-title">
          🎓 Student <span>Picker</span>
        </h1>
        <div className="wheel-tabs">
          {state.grades.map((g, i) => (
            <button
              key={g.label}
              type="button"
              className={i === state.current ? 'wheel-tab is-active' : 'wheel-tab'}
              onClick={() => !spinning && wheel.setCurrent(i)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="wheel-spacer" />
        <label className="wheel-toggle">
          <input
            type="checkbox"
            checked={state.removeOnPick}
            onChange={(e) => wheel.setRemoveOnPick(e.target.checked)}
          />
          <span className="wheel-knob" />
          Remove picked
        </label>
        <button
          type="button"
          className="wheel-hbtn"
          onClick={() => wheel.setMuted(!state.muted)}
          title="Sound on/off"
        >
          {state.muted ? '🔇' : '🔊'}
        </button>
        <button type="button" className="wheel-hbtn" onClick={openPanel}>
          ✏️ Edit names
        </button>
      </header>

      <div className="wheel-modebar">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            type="button"
            className={key === state.mode ? 'wheel-mode is-active' : 'wheel-mode'}
            onClick={() => !spinning && wheel.setMode(key)}
          >
            <span className="wheel-mode-ic">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="wheel-stage">
        {pool.length === 0 ? (
          <div className="wheel-emptymsg">
            <div>
              🏆 Everyone in <b>{grade.label}</b> has been picked!
            </div>
            <button type="button" className="wheel-hbtn" onClick={wheel.resetPool}>
              ♻️ Reset the pool
            </button>
          </div>
        ) : (
          <>
            <ModeComponent key={state.mode} ref={modeRef} pool={pool} muted={state.muted} burst={(...a) => confettiRef.current?.burst(...a)} />
            <button
              type="button"
              className="wheel-gobtn"
              onClick={startSpin}
              disabled={spinning}
            >
              {modeInfo.btn}
            </button>
          </>
        )}
      </div>

      <div className="wheel-tray">
        <span className="wheel-lbl">
          👥 In pool: {pool.length}/{grade.names.length}
        </span>
        {grade.picked.length > 0 && <span className="wheel-lbl">· Picked:</span>}
        <div className="wheel-chips">
          {grade.picked.map((name) => (
            <span className="wheel-chip" key={name}>
              {name}{' '}
              <b
                title="Return to pool"
                onClick={() => !spinning && wheel.unmarkPicked(name)}
              >
                ✕
              </b>
            </span>
          ))}
        </div>
        <div className="wheel-spacer" />
        <button
          type="button"
          className="wheel-hbtn"
          onClick={() => !spinning && wheel.resetPool()}
        >
          ♻️ Reset pool
        </button>
      </div>

      <div className={panelOpen ? 'wheel-scrim is-show' : 'wheel-scrim'} onClick={closePanel} />
      <aside className={panelOpen ? 'wheel-panel is-open' : 'wheel-panel'}>
        <h2>✏️ Edit class</h2>
        <label htmlFor="wheel-grade-label">Grade name</label>
        <input
          id="wheel-grade-label"
          type="text"
          maxLength={24}
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
        />
        <label htmlFor="wheel-names-area">Students — one name per line</label>
        <textarea
          id="wheel-names-area"
          spellCheck={false}
          value={editNames}
          onChange={(e) => setEditNames(e.target.value)}
        />
        <div className="wheel-panel-row">
          <button type="button" className="wheel-pbtn wheel-pbtn-save" onClick={saveEdits}>
            Save
          </button>
          <button type="button" className="wheel-pbtn wheel-pbtn-ghost" onClick={restoreDefaults}>
            Restore defaults
          </button>
        </div>
        <button type="button" className="wheel-pbtn wheel-pbtn-ghost" onClick={closePanel}>
          Close
        </button>
      </aside>

      <div className={winnerName ? 'wheel-winover is-show' : 'wheel-winover'} onClick={(e) => e.target === e.currentTarget && closeWinner()}>
        <div className="wheel-wincard">
          <div className="wheel-win-sub">{grade.label} · and the winner is</div>
          <div className="wheel-win-name">{winnerName}</div>
          <div className="wheel-win-btns">
            <button type="button" className="wheel-wbtn wheel-wbtn-primary" onClick={pickAgain}>
              🎲 Pick again
            </button>
            {!state.removeOnPick && winnerName && !grade.picked.includes(winnerName) && (
              <button type="button" className="wheel-wbtn wheel-wbtn-ghost" onClick={removeWinnerFromPool}>
                Remove from pool
              </button>
            )}
            <button type="button" className="wheel-wbtn wheel-wbtn-ghost" onClick={closeWinner}>
              Close
            </button>
          </div>
        </div>
      </div>

      <Confetti ref={confettiRef} />
    </div>
  );
};

export default WheelOfNames;
