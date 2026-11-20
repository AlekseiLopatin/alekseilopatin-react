import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme, THEMES } from '../theme/ThemeContext';
import { PageMeta } from '../components/PageMeta';
import engine from '../components/math-buddy/engine';
import heroes from '../components/math-buddy/heroes';
import fractions from '../components/math-buddy/fractions';
import practice from '../components/math-buddy/practice';
import saves from '../components/math-buddy/saves';
import { KEY, readProgress, storeProgress, restoreProgress, download } from '../components/math-buddy/storage';
import './MathBuddyPage.css';
import ClassroomRound from '../components/math-buddy/ClassroomRound';
import Diagram from '../components/math-buddy/Diagram';
import { topics as curriculumTopics, availableLevels } from '../components/math-buddy/curriculum';

function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog className={`mb-modal ${wide ? 'mb-modal-wide' : ''}`} ref={ref} onCancel={onClose} onClose={onClose}>
    <div className="mb-modal-heading"><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">✕</button></div>{children}
  </dialog>;
}
function Avatar({ appearance }) {
  // Markup comes only from our SVG renderer with validated catalogue choices.
  return <span className="mb-avatar" dangerouslySetInnerHTML={{ __html: heroes.svg(appearance) }} />;
}
function Fraction({ n, d }) {
  return d === 1 ? <span>{n}</span> : <span className="mb-fraction" role="math" aria-label={`${n} over ${d}`}><span aria-hidden="true">{n}</span><span aria-hidden="true">{d}</span></span>;
}
function Question({ question: q, revealed, compact = false }) {
  const isFraction = q.kind === 'fraction';
  return <>
    <div className={`mb-question ${q.kind === 'practice' && q.layout !== 'calculation' ? 'mb-word-question' : ''}`}>
      {isFraction ? q.topic === 'simplify' ? <Fraction n={q.n} d={q.d} /> : <><Fraction n={q.a1} d={q.b1} /><span>{{ add: '+', sub: '−', mul: '×', div: '÷' }[q.topic]}</span><Fraction n={q.a2} d={q.b2} /></> : q.kind === 'practice' ? q.prompt : `${q.a} ${q.operator} ${q.b}`}
    </div>
    {!compact && <div className={`mb-answer ${revealed ? 'mb-revealed' : ''}`} aria-live="polite">
      {!revealed ? 'Solve in your notebooks first' : isFraction ? <><span>=</span><Fraction n={q.simN} d={q.simD} /></> : q.answer}
    </div>}
    {revealed && isFraction && q.topic === 'simplify' && <p className="mb-answer-note">Divide both by {q.k}</p>}
  </>;
}
function HeroEditor({ student, index, onSave, onClose }) {
  const [draft, setDraft] = useState(() => heroes.sanitize(student.appearance, student.xp, index));
  const level = heroes.level(student.xp), next = heroes.items.find(item => item.level > level);
  const change = (key, value) => setDraft(old => heroes.sanitize({ ...old, [key]: value }, student.xp, index));
  return <Modal title={`${student.name} · Your hero`} onClose={onClose}>
    <div className="mb-hero-preview"><Avatar appearance={draft} /><div><strong>Level {level} · {student.xp} total XP</strong><p>{student.xp % 100} / 100 XP to next level</p><p>{next ? `Next: ${next.name} at level ${next.level}` : 'All current items unlocked. Your level keeps growing!'}</p></div></div>
    <form onSubmit={event => { event.preventDefault(); onSave(draft); }}>
      <div className="mb-editor-grid"><label>Character<select aria-label="Character" value={draft.character} onChange={event => change('character', Number(event.target.value))}>{heroes.characters.map((name, i) => <option key={name} value={i}>{name}</option>)}</select></label>
        <label>Color<select aria-label="Color" value={draft.color} onChange={event => change('color', event.target.value)}>{Object.keys(heroes.colors).map(name => <option key={name} value={name}>{name}</option>)}</select></label>
        {heroes.slots.map(slot => <label key={slot}>{slot[0].toUpperCase() + slot.slice(1)}<select aria-label={slot[0].toUpperCase() + slot.slice(1)} value={draft[slot] || ''} onChange={event => change(slot, event.target.value || null)}><option value="">None</option>{heroes.items.filter(item => item.slot === slot).map(item => <option key={item.id} value={item.id} disabled={item.level > level}>{item.name}{item.level > level ? ` — Unlocks at level ${item.level}` : ''}</option>)}</select></label>)}
      </div><p>Changing your hero never changes your XP. Rewards are cosmetic only.</p><div className="mb-dialog-actions"><button type="button" onClick={onClose}>Cancel</button><button className="mb-primary">Save hero</button></div>
    </form>
  </Modal>;
}
function Guide({ onClose }) {
  return <Modal title="How to play" onClose={onClose}>
    <p><strong>Five-question rounds:</strong> Set attendance first, choose a topic and start. Enlarge each question or show all five. Students write in notebooks, then exchange them before you begin checking. Reveal each answer and enter results in Results & checking partners. All results start unmarked. Review and confirm the batch award. Practice history suggests topics to revisit.</p><ol className="mb-guide">
      <li><strong>Prepare.</strong> Choose a class. In Teacher, mark absent students. Select a topic and difficulty, then use Full screen.</li>
      <li><strong>Choose a leader.</strong> Take turns fairly. The leader helps mark answers and earns double XP this round.</li>
      <li><strong>Everyone solves.</strong> Students work in their notebooks. Ask them to finish writing before revealing the answer.</li>
      <li><strong>Check together.</strong> Select Show answer, then Show explanation when available. All present students start as Correct. Tap a hero to switch to Attempt. Select all / Deselect all affect participating students only.</li>
      <li><strong>Award XP.</strong> The teacher checks the results and sets No XP if needed. Correct earns 10 XP, an attempt earns 3 XP; the leader earns ×2. Select Award XP once. Use Undo to correct the last award.</li>
      <li><strong>Keep going.</strong> Select Next question. Customize heroes after the exercise. Every 100 XP adds a level; cosmetic rewards unlock at levels 2–10.</li>
      <li><strong>Back up.</strong> After the lesson, use Teacher → Export progress. To move from the local prototype or another computer, import that JSON file here.</li>
    </ol><p>Progress lives in this browser on this website, not in an account. XP rewards participation; it is not a mastery score.</p>
  </Modal>;
}

export default function MathBuddyPage() {
  const { theme, setTheme } = useTheme();
  const [initial] = useState(readProgress);
  const [state, setState] = useState(initial.state), current = useRef(initial.state);
  const protectedSave = useRef(initial.protected);
  const [saveError, setSaveError] = useState(initial.protected);
  const [modal, setModal] = useState(null), [editing, setEditing] = useState(null), [promoted, setPromoted] = useState([]);
  const [imported, setImported] = useState(null), [notice, setNotice] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [focus, setFocus] = useState(false);
  const g = state.classes[state.active], r = g.round, awarded = r.phase === 'awarded', revealed = r.phase !== 'solve';
  useEffect(() => {
    document.documentElement.classList.add('mb-active');
    const before = document.documentElement.lang; document.documentElement.lang = 'en';
    const changed = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', changed);
    return () => { document.documentElement.classList.remove('mb-active'); document.documentElement.lang = before; document.removeEventListener('fullscreenchange', changed); };
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer); }, [notice]);
  function commit(next) {
    current.current = next; setState(next);
    try { if (protectedSave.current) throw new Error('Protected save'); storeProgress(next); setSaveError(false); }
    catch { setSaveError(true); setNotice('Unable to save. Export progress before closing. Existing unreadable data is protected.'); }
  }
  function mutate(fn) { const next = structuredClone(current.current); fn(next.classes[next.active], next); commit(next); }
  function setQuestion(topic, difficulty) { mutate(c => { if (c.round.phase !== 'solve') return; difficulty = availableLevels(topic).includes(difficulty) ? difficulty : availableLevels(topic)[0]; c.round.topic = topic; c.round.difficulty = difficulty; c.round.question = engine.createQuestion(topic, difficulty); }); }
  function markAll(status) { mutate(c => { if (c.round.phase === 'awarded') return; c.round.statuses = c.round.statuses.map(s => ['correct', 'attempt'].includes(s) ? status : s); }); }
  function award(event) {
    if (event.detail > 1) return;
    const next = structuredClone(current.current), c = next.classes[next.active];
    if (c.round.phase === 'awarded') { c.round = engine.newRound(c.students, c.round.question.kind ? c.round.topic : 'simplify', c.round.difficulty || 'easy'); c.roundNumber++; commit(next); return; }
    const before = c.students.map(s => heroes.level(s.xp));
    if (!engine.award(c)) return;
    const raised = c.students.flatMap((s, i) => heroes.level(s.xp) > before[i] ? [{ name: s.name, level: heroes.level(s.xp), rewards: heroes.items.filter(item => item.level > before[i] && item.level <= heroes.level(s.xp)) }] : []);
    commit(next); setPromoted(raised);
    if (raised.length) setModal('levels'); else setNotice('XP awarded. Every attempt counts!');
  }
  function undo() {
    const next = structuredClone(current.current), c = next.classes[next.active];
    const before = c.students.map(s => JSON.stringify(s.appearance));
    if (!engine.undo(c)) return;
    const removed = c.students.some((s, i) => JSON.stringify(s.appearance) !== before[i]);
    commit(next); setNotice(removed ? 'Award undone. Newly locked items were unequipped.' : 'Last award undone. You can adjust the results.');
  }
  function editStudent(index, key, value) {
    mutate(c => {
      if (c.batch && c.batch.phase !== 'awarded' && key !== 'name') return;
      const s = c.students[index];
      if (key === 'name') s.name = value.trim() || `Student ${index + 1}`;
      if (key === 'present' && c.round.phase !== 'awarded') { s.present = value; c.round.statuses[index] = value ? 'correct' : 'absent'; if (!value && c.round.leader === index) c.round.leader = null; }
      if (key === 'exclude' && c.round.phase !== 'awarded' && s.present) c.round.statuses[index] = value ? 'none' : 'correct';
      c.undo = null; c.batchUndo = null;
    });
  }
  async function importFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try { if (file.size > 5_000_000) throw new Error('size'); setImported(saves.validate(JSON.parse(await file.text()))); }
    catch { setImported(null); setNotice('Invalid backup. Use a Math Buddy JSON export under 5 MB. No progress was changed.'); }
  }
  function restore() {
    try { const next = restoreProgress(imported, current.current); protectedSave.current = false; commit(next); setImported(null); setNotice('Progress restored. Previous data was backed up on this device.'); }
    catch { setNotice('Restore failed. Existing progress was not replaced. Check browser storage.'); }
  }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { setNotice('Full screen is unavailable. Try F11.'); }
  }
  const rewards = g.students.map((s, i) => s.present ? (({ correct: 10, attempt: 3 }[r.statuses[i]] || 0) * (r.leader === i ? 2 : 1)) : 0);
  const counts = status => r.statuses.filter(s => s === status).length;
  const leaderLabel = r.leader === null ? 'No leader selected' : `${g.students[r.leader].name}: ${rewards[r.leader]} XP (×2)`;
  const groups = [['Fractions', fractions.topics], ['Decimals', Object.fromEntries(Object.entries(practice.topics).filter(([key]) => key.startsWith('decimal-')))], ['Percentages', Object.fromEntries(Object.entries(practice.topics).filter(([key]) => key.startsWith('percent-')))], ['P5 curriculum & O-NET bridge', curriculumTopics]];
  return <div className="mb-app" lang="en">
    <PageMeta title="Math Buddy — Aleksei Lopatin" description="Classroom maths practice with heroes, experience and progress. Fractions, decimals and percentages." />
    <header className="mb-header"><Link to="/" className="mb-brand">math buddy<span>by Aleksei Lopatin</span></Link><div className="mb-header-actions"><span className={saveError ? 'mb-save-error' : 'mb-save-state'} role="status">{saveError ? 'Not saved — export progress' : 'Saved in this browser'}</span><label className="mb-theme"><span className="visually-hidden">Theme</span><select aria-label="Theme" value={theme} onChange={e => setTheme(e.target.value)}>{THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label><button onClick={() => setModal('guide')}>How to play</button><button onClick={toggleFullscreen}>{fullscreen ? 'Exit full screen' : 'Full screen'}</button></div></header>
    <main className="mb-main"><div className="mb-heading"><div><p>PLAY TOGETHER, GROW TOGETHER</p><h1>Every answer is a step forward.</h1></div><label>Class<select aria-label="Class" value={state.active} onChange={e => mutate((c, s) => { s.active = Number(e.target.value); })}>{state.classes.map((c, i) => <option key={i} value={i}>{c.name}</option>)}</select></label></div>
      <div className="mb-mode-switch"><button aria-pressed={g.mode !== 'batch'} disabled={g.batch && g.batch.phase !== 'awarded'} onClick={() => mutate(c => { c.mode = 'single'; })}>Single question & heroes</button><button aria-pressed={g.mode === 'batch'} onClick={() => mutate(c => { c.mode = 'batch'; })}>Five-question round</button>{g.mode !== 'batch' && <button onClick={() => setFocus(true)}>Enlarge question</button>}</div>
      {g.mode === 'batch' ? <ClassroomRound key={state.active} group={g} mutate={mutate} Question={Question} onTeacher={() => setModal('teacher')} /> : <div className="mb-workspace"><aside className="mb-sidebar"><section className="mb-panel mb-quest"><div className="mb-kicker"><span>TODAY’S QUEST</span><span>ROUND {g.roundNumber}</span></div><h2>{r.question.kind ? engine.topics[r.topic] : 'Finish your saved round'}</h2><div className="mb-question-controls"><label>Topic<select aria-label="Topic" disabled={revealed} value={r.question.kind ? r.topic : 'legacy'} onChange={e => setQuestion(e.target.value, r.difficulty || 'easy')}>{!r.question.kind && <option value="legacy">Previous arithmetic round</option>}{groups.map(([label, entries]) => <optgroup key={label} label={label}>{Object.entries(entries).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</optgroup>)}</select></label><label>Difficulty<select aria-label="Difficulty" disabled={revealed || !r.question.kind} value={r.difficulty || 'easy'} onChange={e => setQuestion(r.topic, e.target.value)}>{Object.entries(fractions.difficulties).filter(([id]) => availableLevels(r.topic).includes(id)).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label></div><Question question={r.question} revealed={revealed} /><Diagram diagram={r.question.diagram} /><button className="mb-primary" disabled={revealed} onClick={() => mutate(c => { c.round.phase = 'review'; })}>{revealed ? 'Answer revealed' : 'Show answer'}</button>{revealed && r.question.explanation && <button onClick={() => setModal('explanation')}>Show explanation</button>}</section>
        <section className="mb-panel mb-leader"><div className="mb-kicker">INSPIRATION</div><h2>Today’s class leader</h2><select aria-label="Class leader" disabled={awarded} value={r.leader ?? ''} onChange={e => mutate(c => { c.round.leader = e.target.value === '' ? null : Number(e.target.value); })}><option value="">Choose a student</option>{g.students.map((s, i) => s.present && <option key={i} value={i}>{s.name} · turns: {s.turns}</option>)}</select><p><strong>×2 XP</strong> For being brave enough to try</p></section>
      </aside><section className="mb-classroom"><div className="mb-roster-heading"><div><h2>Our hero team <small>{g.students.filter(s => s.present).length}/30</small></h2><p>{awarded ? 'Rewards earned. Ready for the next question?' : 'Tap a hero to switch between Correct and Attempt.'}</p></div><button onClick={() => setModal('teacher')}>Teacher</button></div><div className="mb-roster-tools"><span>✓ Correct · Try: Attempt</span><div><button disabled={awarded} onClick={() => markAll('correct')}>Select all</button><button disabled={awarded} onClick={() => markAll('attempt')}>Deselect all</button></div></div>
        <div className="mb-roster">{g.students.map((s, i) => <button key={i} className={`mb-student ${r.leader === i ? 'mb-is-leader' : ''}`} data-status={r.statuses[i]} disabled={awarded || ['none', 'absent'].includes(r.statuses[i])} aria-pressed={r.statuses[i] === 'correct'} aria-label={`${s.name}: ${{correct:'Correct',attempt:'Attempt',none:'No XP',absent:'Absent'}[r.statuses[i]]}, ${s.xp} XP`} onClick={() => mutate(c => { if (c.round.phase !== 'awarded') c.round.statuses[i] = c.round.statuses[i] === 'correct' ? 'attempt' : 'correct'; })}><span className="mb-status">{{ correct: '✓', attempt: 'Try', none: '—', absent: 'Absent' }[r.statuses[i]]}</span>{r.leader === i && <span className="mb-leader-badge">×2</span>}<Avatar appearance={heroes.sanitize(s.appearance, s.xp, i)} /><strong className="mb-student-name">{s.name}</strong><span className="mb-student-meta"><span>Lv. {heroes.level(s.xp)}</span><span>{s.xp % 100} / 100 XP</span></span><span className="mb-xp-track"><span style={{ width: `${s.xp % 100}%` }} /></span>{awarded && r.gains[i] > 0 && <span className="mb-gain">+{r.gains[i]} XP</span>}</button>)}</div>
        <div className="mb-award-bar"><div><strong>{counts('correct')} correct · {counts('attempt')} attempts</strong><p>{revealed ? awarded ? 'Level up every 100 XP.' : `${rewards.filter(n => n > 0).length} rewards · ${leaderLabel}` : 'Reveal the answer to award XP.'}</p></div><div><button disabled={!g.undo} onClick={undo}>Undo</button><button className="mb-primary" disabled={!revealed} onClick={award}>{awarded ? 'Next question' : 'Award XP'}</button></div></div>
      </section></div>}
    </main>
    {focus && <Modal title="Classroom focus" wide onClose={() => setFocus(false)}><div className="mb-focus-question"><Question question={r.question} revealed={revealed} /><Diagram diagram={r.question.diagram} /></div><button className="mb-primary" disabled={revealed} onClick={() => mutate(c => { c.round.phase = 'review'; })}>Show answer</button>{revealed && <p>{r.question.explanation}</p>}</Modal>}
    {modal === 'guide'  && <Guide onClose={() => setModal(null)} />}
    {modal === 'explanation' && <Modal title="Let’s work it out" onClose={() => setModal(null)}><p className="mb-explanation">{r.question.explanation}</p></Modal>}
    {modal === 'levels' && <Modal title="Level up!" onClose={() => setModal(null)}><ul className="mb-levels">{promoted.map((p, i) => <li key={i}><strong>{p.name} · Level {p.level}</strong><p>{p.rewards.map(item => item.name).join(', ') || 'Keep growing! All current items unlocked.'}</p></li>)}</ul><button className="mb-primary" onClick={() => setModal(null)}>Keep going</button></Modal>}
    {modal === 'teacher' && <Modal title="Teacher settings" wide onClose={() => setModal(null)}><p>Absent students sit out the round. No XP applies to this round only. Changes save immediately. Editing names or attendance clears Undo. Attendance is locked during a five-question round; set it before starting.</p><div className="mb-backup-tools"><button onClick={() => download(JSON.stringify(current.current, null, 2), 'math-buddy-progress.json')}>Export progress</button><button onClick={() => { try { const raw = localStorage.getItem(`${KEY}-before-import`) || localStorage.getItem(`${KEY}-before-v2`); if (raw) download(raw, 'math-buddy-previous-backup.json'); else setNotice('No automatic backup yet. Export progress to save your classes.'); } catch { setNotice('Unable to read the backup.'); } }}>Export previous backup</button><label className="mb-file-label">Import backup<input type="file" accept=".json,application/json" aria-label="Import backup" onChange={importFile} /></label></div><div className="mb-teacher-list">{g.students.map((s, i) => <div className="mb-teacher-row" key={`${state.active}-${i}`}><span>{i + 1}</span><input aria-label={`Student ${i + 1} name`} maxLength={100} defaultValue={s.name} key={`${state.active}-${i}-${s.name}`} onBlur={e => { if (e.target.value.trim() !== s.name) editStudent(i, 'name', e.target.value); }} /><label><input type="checkbox" checked={s.present} disabled={awarded || (g.batch && g.batch.phase !== 'awarded')} onChange={e => editStudent(i, 'present', e.target.checked)} />Present</label><label><input type="checkbox" checked={r.statuses[i] === 'none'} disabled={awarded || !s.present || (g.batch && g.batch.phase !== 'awarded')} onChange={e => editStudent(i, 'exclude', e.target.checked)} />No XP</label><button aria-label={`Customize ${s.name}`} onClick={() => setEditing(i)}>Customize</button></div>)}</div><button className="mb-primary" onClick={() => setModal(null)}>Done</button></Modal>}
    {editing !== null && <HeroEditor index={editing} student={g.students[editing]} onClose={() => setEditing(null)} onSave={appearance => { mutate(c => { c.students[editing].appearance = heroes.sanitize(appearance, c.students[editing].xp, editing); }); setEditing(null); setNotice('Hero saved. Your XP stays with you.'); }} />}
    {imported && <Modal title="Restore progress?" onClose={() => setImported(null)}><p>3 classes · 90 students · {imported.classes.reduce((sum, c) => sum + c.students.reduce((n, s) => n + s.xp, 0), 0)} total XP.</p><p>This replaces all three classes, names, XP, heroes and rounds. Current stored progress will be backed up on this device first.</p><div className="mb-dialog-actions"><button onClick={() => setImported(null)}>Cancel</button><button className="mb-primary" onClick={restore}>Replace progress</button></div></Modal>}
    {notice && <div className="mb-toast" role="status">{notice}</div>}
  </div>;
}
