import { useEffect, useReducer, useRef, useState } from 'react';
import { lessonReducer } from './model';

export default function Lesson({ cards, title, tr, onExit }) {
  const [state, dispatch] = useReducer(lessonReducer, { cards, index: 0, stage: 0, marked: [], done: false, review: false });
  const [notice, setNotice] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const root = useRef(null);
  const card = state.cards[state.index];
  useEffect(() => { root.current?.focus(); }, []);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === root.current);
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const exit = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onExit();
  };
  useEffect(() => {
    const handle = e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === 'Escape') {
        // Let the browser leave fullscreen first; keep the lesson open.
        if (document.fullscreenElement) return;
        e.preventDefault(); exit(); return;
      }
      if (state.done) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); dispatch({ type: 'next' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); dispatch({ type: 'previous' }); }
      if (e.key.toLowerCase() === 'r') { e.preventDefault(); dispatch({ type: 'mark' }); }
      if (e.code === 'Space' && !/BUTTON|A/.test(e.target.tagName)) {
        e.preventDefault();
        dispatch({ type: state.stage < (card.explanation ? 2 : 1) ? 'reveal' : 'next' });
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  });
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen();
      else throw new Error('unsupported');
      setNotice('');
    } catch { setNotice(tr('Полноэкранный режим недоступен. Можно продолжать в этом окне.', 'Fullscreen is unavailable. Continue in this window.')); }
  }
  return <section className="mf-lesson" ref={root} tabIndex={-1} aria-label={tr('Режим урока', 'Lesson mode')}>
    <header className="mf-lesson-bar">
      <button onClick={exit}>{tr('← К подготовке', '← Back to preparation')}</button>
      <span>{title} {state.review && ` / ${tr('Повторение', 'Review')}`}</span>
      <button onClick={fullscreen}>{isFullscreen ? tr('Выйти из полного экрана', 'Exit fullscreen') : tr('Полный экран', 'Fullscreen')}</button>
    </header>
    {notice && <p role="status">{notice}</p>}
    {state.done ? <div className="mf-complete">
      <p className="mf-kicker">{tr('Набор завершён', 'Deck complete')}</p>
      <h1>{tr('Хорошая работа!', 'Well done!')}</h1>
      <p>{tr('Отмечено для повторения: ', 'Marked for review: ')}{state.marked.length}</p>
      <button className="mf-primary" disabled={!state.marked.length} onClick={() => dispatch({ type: 'review' })}>{tr('Повторить отмеченные', 'Review marked cards')}</button>
      <button onClick={exit}>{tr('Завершить урок', 'Finish lesson')}</button>
    </div> : <>
      <div className="mf-stage">
        <p className="mf-kicker">{state.index + 1} / {state.cards.length} · {tr('Задание', 'Question')}</p>
        <h1 className={`mf-question ${card.question.length > 120 ? 'mf-long' : ''}`}>{card.question}</h1>
        {state.stage > 0 && <div className="mf-answer" role="status"><p className="mf-kicker">{tr('Ответ', 'Answer')}</p><p>{card.answer}</p></div>}
        {state.stage > 1 && <div className="mf-explanation"><p className="mf-kicker">{tr('Объяснение', 'Explanation')}</p><p>{card.explanation}</p></div>}
      </div>
      <div className="mf-lesson-controls">
        <button disabled={state.index === 0} onClick={() => dispatch({ type: 'previous' })}>← {tr('Назад', 'Previous')}</button>
        {state.stage === 0 ? <button className="mf-primary" onClick={() => dispatch({ type: 'reveal' })}>{tr('Показать ответ', 'Show answer')}</button>
          : <><button onClick={() => dispatch({ type: 'hide' })}>{tr('Скрыть ответ', 'Hide answer')}</button>{state.stage === 1 && card.explanation && <button className="mf-primary" onClick={() => dispatch({ type: 'reveal' })}>{tr('Показать объяснение', 'Show explanation')}</button>}</>}
        <button aria-pressed={state.marked.includes(card.id)} onClick={() => dispatch({ type: 'mark' })}>{state.marked.includes(card.id) ? '✓ ' : ''}{tr('Повторить позже', 'Review later')}</button>
        <button onClick={() => dispatch({ type: 'next' })}>{state.index + 1 === state.cards.length ? tr('Завершить', 'Finish') : tr('Далее →', 'Next →')}</button>
      </div>
      <p className="mf-shortcuts">{tr('Пробел: ответ → объяснение → далее · ← →: переход · R: повторить · Esc: выйти', 'Space: answer → explanation → next · ← →: navigate · R: mark · Esc: exit')}</p>
    </>}
  </section>;
}
