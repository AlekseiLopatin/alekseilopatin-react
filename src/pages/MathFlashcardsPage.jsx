import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme, THEMES } from '../theme/ThemeContext';
import { PageMeta } from '../components/PageMeta';
import Lesson from '../components/math-flashcards/Lesson';
import { thai } from '../components/math-flashcards/th';
import { readLibrary, newId, serializeDecks, validateDecks, cloneImportedDecks, parseRows, shuffled, STORAGE_KEY, MAX_CARDS } from '../components/math-flashcards/model';
import './MathFlashcardsPage.css';

const blank = { question: '', answer: '', explanation: '' };
export default function MathFlashcardsPage() {
  const { lang: siteLang, setLang: setSiteLang } = useLanguage();
  const [lang, updateLang] = useState(() => {
    try { const saved = localStorage.getItem('al-math-language'); return ['en', 'ru', 'th'].includes(saved) ? saved : siteLang; }
    catch { return siteLang; }
  });
  const setLang = value => {
    updateLang(value);
    try { localStorage.setItem('al-math-language', value); } catch { /* In-memory preference still works. */ }
    if (value !== 'th') setSiteLang(value);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = siteLang; };
  }, [lang, siteLang]);
  const { theme, setTheme } = useTheme();
  const tr = (ru, en, th) => lang === 'ru' ? ru : lang === 'th' ? th ?? thai[en] ?? en : en;
  const [library, setLibrary] = useState(readLibrary);
  const decks = library.decks;
  const [selected, setSelected] = useState(() => decks[0]?.id ?? '');
  const deck = decks.find(d => d.id === selected);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [bulk, setBulk] = useState('');
  const [preview, setPreview] = useState(null);
  const [imported, setImported] = useState(null);
  const [notice, setNotice] = useState('');
  const [session, setSession] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const unsaved = Boolean(draft.question || draft.answer || draft.explanation || bulk || titleDraft || library.issue === 'write');
  useEffect(() => {
    if (!unsaved) return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved]);
  function commit(next) {
    let issue = '';
    try { localStorage.setItem(STORAGE_KEY, serializeDecks(next)); }
    catch { issue = 'write'; }
    setLibrary({ decks: next, issue });
  }
  function select(id) {
    if ((draft.question || draft.answer || draft.explanation || bulk) && !window.confirm(tr('Отбросить несохранённые поля?', 'Discard unsaved fields?'))) return;
    setSelected(id); setDraft(blank); setEditing(null); setBulk(''); setPreview(null); setTitleDraft(''); setNotice('');
  }
  function changeCards(cards) { commit(decks.map(d => d.id === deck.id ? { ...d, cards } : d)); }
  function addDeck(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (decks.length >= 100) { setNotice(tr('Максимум 100 наборов.', 'Maximum 100 decks.')); return; }
    const d = { id: newId(), title: name.trim(), cards: [] };
    commit([...decks, d]); setName(''); select(d.id);
  }
  function saveCard(e) {
    e.preventDefault();
    if (!draft.question.trim() || !draft.answer.trim()) { setNotice(tr('Заполни вопрос и ответ.', 'Enter a question and an answer.')); return; }
    if (!editing && deck.cards.length >= MAX_CARDS) { setNotice(tr('Максимум 500 карточек в наборе.', 'Maximum 500 cards per deck.')); return; }
    const card = { id: editing ?? newId(), ...Object.fromEntries(Object.entries(draft).map(([k,v]) => [k, v.trim()])) };
    changeCards(editing ? deck.cards.map(c => c.id === editing ? card : c) : [...deck.cards, card]);
    setDraft(blank); setEditing(null); setNotice(tr('Карточка сохранена.', 'Card saved.'));
  }
  function exportLibrary() {
    const url = URL.createObjectURL(new Blob([serializeDecks(decks)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'math-flashcards.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(e) {
    const file = e.target.files?.[0]; e.target.value = ''; setImported(null);
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error('size');
      const next = validateDecks(JSON.parse(await file.text()));
      if (!next.length || next.length + decks.length > 100) throw new Error('size');
      setImported(next); setNotice('');
    } catch { setNotice(tr('Не удалось импортировать. Нужен экспорт Math Flashcards (до 5 МБ, всего до 100 наборов).', 'Import failed. Use a Math Flashcards export (up to 5 MB, 100 decks in total).')); }
  }
  const meta = <PageMeta title="Math Flashcards — Aleksei Lopatin" description={tr('Карточки для уроков математики и репетиторства.', 'Flashcards for maths lessons and tutoring.')} />;
  if (session) return <>{meta}<Lesson cards={session.cards} title={session.title} tr={tr} onExit={() => setSession(null)} /></>;
  return <div className="mf-app">
    {meta}
    <header className="mf-top"><Link to="/">← {tr('К проектам', 'Projects')}</Link><div className="mf-settings">
      <label>{tr('Язык', 'Language')}<select aria-label={tr('Язык', 'Language')} value={lang} onChange={e => setLang(e.target.value)}><option value="en">English</option><option value="ru">Русский</option><option value="th">ไทย</option></select></label>
      <div className="mf-theme-switcher" role="group" aria-label={tr('Тема', 'Theme')}>{THEMES.map(t => <button type="button" key={t.id} onClick={() => setTheme(t.id)} aria-label={t.label} title={t.label} aria-pressed={theme === t.id}><span aria-hidden="true">{t.icon}</span></button>)}</div>
    </div></header>
    <main className="mf-main">
      <div className="mf-heading"><p className="mf-kicker">{tr('Инструмент преподавателя', 'Teaching tool')}</p><h1>Math Flashcards</h1><p>{tr('Подготовь задания. Открой на экране. Проведи урок в своём темпе.', 'Prepare your questions. Open them on screen. Teach at your own pace.')}</p></div>
      <div className="mf-transfer"><button onClick={exportLibrary}>{tr('Экспорт всех наборов', 'Export all decks')}</button><label className="mf-file">{tr('Импорт JSON', 'Import JSON')}<input type="file" accept=".json,application/json" onChange={importFile} /></label><p>{tr('Наборы хранятся только в этом браузере. Экспортируй копию для школы или резервного хранения.', 'Decks live only in this browser. Export a copy for school or backup.')}</p></div>
      {library.issue && <p className="mf-warning" role="alert">{library.issue === 'read' ? tr('Не удалось прочитать сохранение. Исходные данные не изменены. Новые изменения заменят его — сначала сохрани резервную копию данных браузера.', 'Saved data could not be read and has not been changed. New changes will replace it — back up browser data first.') : tr('Изменения есть только в памяти. Экспортируй наборы перед закрытием страницы.', 'Changes are only in memory. Export your decks before closing this page.')}</p>}
      {imported && <section className="mf-panel"><h2>{tr('Предпросмотр импорта', 'Import preview')}</h2><ul>{imported.map(d => <li key={d.id}>{d.title} · {d.cards.length}</li>)}</ul><p>{tr('Будут добавлены новые копии. Существующие наборы сохранятся.', 'New copies will be added. Existing decks will stay unchanged.')}</p><button onClick={() => { const copies = cloneImportedDecks(imported); commit([...decks, ...copies]); setImported(null); setNotice(tr('Наборы импортированы.', 'Decks imported.')); }}>{tr('Добавить наборы', 'Add decks')}</button><button onClick={() => setImported(null)}>{tr('Отмена', 'Cancel')}</button></section>}
      <p className="mf-notice" role="status">{notice}</p>
      <div className="mf-workspace">
        <aside className="mf-panel mf-decks"><h2>{tr('Мои наборы', 'My decks')}</h2><p className="mf-muted">{tr('Стартовые наборы — примеры. Можно менять их под свой класс.', 'The starter decks are examples. Adapt them for your class.')}</p>
          <div className="mf-deck-list">{decks.map(d => <button key={d.id} aria-pressed={selected === d.id} onClick={() => select(d.id)}><span>{d.title}</span><small>{d.cards.length} {tr('карточек', 'cards')}</small></button>)}</div>
          <form onSubmit={addDeck}><label htmlFor="mf-new-name">{tr('Название нового набора', 'New deck name')}</label><input id="mf-new-name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} /><button type="submit">+ {tr('Создать набор', 'Create deck')}</button></form>
        </aside>
        {deck ? <section className="mf-editor" key={deck.id}>
          <div className="mf-panel"><div className="mf-deck-heading"><h2>{deck.title}</h2><button className="mf-danger" onClick={() => { if (window.confirm(tr(`Удалить набор «${deck.title}» и все его карточки?`, `Delete “${deck.title}” and all its cards?`, `ลบชุด “${deck.title}” และบัตรทั้งหมดในชุดหรือไม่?`))) { const next = decks.filter(d => d.id !== deck.id); commit(next); setSelected(next[0]?.id ?? ''); setDraft(blank); setEditing(null); setBulk(''); setPreview(null); setTitleDraft(''); } }}>{tr('Удалить набор', 'Delete deck')}</button></div>
            <form className="mf-rename" onSubmit={e => { e.preventDefault(); if (titleDraft.trim()) { commit(decks.map(d => d.id === deck.id ? { ...d, title: titleDraft.trim() } : d)); setTitleDraft(''); } }}><label htmlFor="mf-rename">{tr('Новое название', 'Rename deck')}</label><input id="mf-rename" value={titleDraft} maxLength={120} onChange={e => setTitleDraft(e.target.value)} /><button disabled={!titleDraft.trim()}>{tr('Переименовать', 'Rename')}</button></form>
            <div className="mf-start"><label><input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} />{tr('Перемешать перед стартом', 'Shuffle before starting')}</label><button className="mf-primary" disabled={!deck.cards.length} onClick={() => { if ((draft.question || draft.answer || draft.explanation || bulk) && !window.confirm(tr('Несохранённые поля не попадут в урок. Продолжить?', 'Unsaved fields will not be in the lesson. Continue?'))) return; setSession({ title: deck.title, cards: shuffle ? shuffled(deck.cards) : [...deck.cards] }); }}>{tr('Начать урок →', 'Start lesson →')}</button></div>
          </div>
          <div className="mf-panel"><h2>{editing ? tr('Редактирование карточки', 'Edit card') : tr('Новая карточка', 'New card')}</h2><form onSubmit={saveCard} className="mf-card-form">
            {['question','answer','explanation'].map((key,i) => <label key={key}>{[tr('Вопрос', 'Question'),tr('Ответ', 'Answer'),tr('Объяснение (необязательно)', 'Explanation (optional)')][i]}<textarea aria-label={[tr('Вопрос', 'Question'),tr('Ответ', 'Answer'),tr('Объяснение (необязательно)', 'Explanation (optional)')][i]} required={key !== 'explanation'} maxLength={key === 'explanation' ? 4000 : 2000} rows={2} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>)}
            <p className="mf-muted">{tr('Обычный текст: 1/2, ×, ÷, x². Сложная вёрстка формул пока не поддерживается.', 'Plain text: 1/2, ×, ÷, x². Advanced formula formatting is not supported yet.')}</p>
            <div className="mf-actions"><button className="mf-primary">{tr('Сохранить карточку', 'Save card')}</button>{editing && <button type="button" onClick={() => { setDraft(blank); setEditing(null); }}>{tr('Отменить редактирование', 'Cancel edit')}</button>}</div>
          </form></div>
          <details className="mf-panel"><summary>{tr('Добавить из таблицы', 'Paste from spreadsheet')}</summary><p>{tr('Без заголовка: вопрос, ответ, объяснение (необязательно). Колонки разделены табуляцией, одна карточка на строку. Многострочные ячейки добавляй через форму выше.', 'No header: question, answer, optional explanation. Tab-separated columns, one card per row. Use the form above for multiline cells.')}</p><label>{tr('Строки из таблицы', 'Spreadsheet rows')}<textarea aria-label={tr('Строки из таблицы', 'Spreadsheet rows')} rows={5} value={bulk} onChange={e => { setBulk(e.target.value); setPreview(null); }} /></label><button onClick={() => setPreview(parseRows(bulk))}>{tr('Предпросмотр', 'Preview')}</button>
            {preview && <><p>{tr('Готово карточек: ', 'Ready cards: ')}{preview.cards.length}</p>{preview.errors.length > 0 && <p className="mf-warning">{tr('Исправь строки: ', 'Fix rows: ')}{preview.errors.join(', ')}</p>}<div className="mf-table-wrap"><table><thead><tr><th>{tr('Вопрос', 'Question')}</th><th>{tr('Ответ', 'Answer')}</th><th>{tr('Объяснение', 'Explanation')}</th></tr></thead><tbody>{preview.cards.slice(0,20).map((c,i) => <tr key={i}><td>{c.question}</td><td>{c.answer}</td><td>{c.explanation}</td></tr>)}</tbody></table></div>{preview.cards.length > 20 && <p>{tr('Показаны первые 20 строк.', 'First 20 rows shown.')}</p>}<button disabled={!preview.cards.length || preview.errors.length > 0 || preview.cards.length + deck.cards.length > MAX_CARDS} onClick={() => { changeCards([...deck.cards, ...preview.cards.map(c => ({ ...c, id: newId() }))]); setBulk(''); setPreview(null); setNotice(tr('Карточки добавлены.', 'Cards added.')); }}>{tr('Добавить карточки', 'Add cards')}</button><p className="mf-muted">{tr('До 500 карточек в наборе.', 'Up to 500 cards per deck.')}</p></>}
          </details>
          <section className="mf-panel"><h2>{tr('Карточки набора', 'Deck cards')} · {deck.cards.length}</h2>{!deck.cards.length && <p>{tr('Добавь первую карточку через форму или вставку из таблицы.', 'Add your first card using the form or spreadsheet paste.')}</p>}<ol className="mf-cards">{deck.cards.map(c => <li key={c.id}><div><strong>{c.question}</strong><p>{c.answer}</p>{c.explanation && <small>{c.explanation}</small>}</div><div className="mf-actions"><button onClick={() => { if ((draft.question || draft.answer || draft.explanation) && !window.confirm(tr('Отбросить несохранённые поля?', 'Discard unsaved fields?'))) return; setEditing(c.id); setDraft({ question: c.question, answer: c.answer, explanation: c.explanation }); document.querySelector('.mf-card-form textarea')?.focus(); }}>{tr('Изменить', 'Edit')}</button><button className="mf-danger" onClick={() => { if (window.confirm(tr('Удалить эту карточку?', 'Delete this card?'))) { changeCards(deck.cards.filter(item => item.id !== c.id)); if (editing === c.id) { setEditing(null); setDraft(blank); } } }}>{tr('Удалить', 'Delete')}</button></div></li>)}</ol></section>
        </section> : <section className="mf-panel"><h2>{tr('Создай свой первый набор', 'Create your first deck')}</h2><p>{tr('Или импортируй ранее сохранённый JSON-файл.', 'Or import a previously exported JSON file.')}</p></section>}
      </div>
    </main>
  </div>;
}
