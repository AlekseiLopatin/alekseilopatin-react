export const STORAGE_KEY = 'al-math-flashcards-v1';
export const MAX_CARDS = 500;
export const newId = () => crypto.randomUUID();

export function demoDecks() {
  const deck = (title, rows) => ({ id: newId(), title, cards: rows.map(([question, answer, explanation]) => ({ id: newId(), question, answer, explanation })) });
  return [
    deck('Multiplication · Умножение', [['8 × 7', '56', '8 × 5 + 8 × 2 = 40 + 16 = 56'], ['12 × 6', '72', '(10 + 2) × 6 = 60 + 12 = 72'], ['9 × 9', '81', '10 × 9 − 9 = 90 − 9 = 81']]),
    deck('Fractions · Дроби', [['1/2 + 1/4', '3/4', '1/2 = 2/4 → 2/4 + 1/4 = 3/4'], ['3/4 − 1/2', '1/4', '3/4 − 2/4 = 1/4'], ['2/3 × 3/4', '1/2', '(2 × 3) / (3 × 4) = 6/12 = 1/2']]),
    deck('Percentages · Проценты', [['25% × 80', '20', '25% = 1/4 → 80 ÷ 4 = 20'], ['10% × 150', '15', '150 ÷ 10 = 15'], ['15% × 200', '30', '10% × 200 + 5% × 200 = 20 + 10 = 30']]),
  ];
}

const validText = (v, max, optional = false) => typeof v === 'string' && v.length <= max && (optional || v.trim().length > 0);
export function validateDecks(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.decks) || value.decks.length > 100) throw new Error('format');
  const ids = new Set();
  for (const deck of value.decks) {
    if (!deck || !validText(deck.id, 150) || ids.has(deck.id) || !validText(deck.title, 120) || !Array.isArray(deck.cards) || deck.cards.length > MAX_CARDS) throw new Error('format');
    ids.add(deck.id);
    const cardIds = new Set();
    for (const card of deck.cards) {
      if (!card || !validText(card.id, 150) || cardIds.has(card.id) || !validText(card.question, 2000) || !validText(card.answer, 2000) || !validText(card.explanation, 4000, true)) throw new Error('format');
      cardIds.add(card.id);
    }
  }
  // Copy only supported fields; imported data never becomes executable markup.
  return value.decks.map(d => ({ id: d.id, title: d.title, cards: d.cards.map(c => ({ id: c.id, question: c.question, answer: c.answer, explanation: c.explanation })) }));
}

export function readLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { decks: raw === null ? demoDecks() : validateDecks(JSON.parse(raw)), issue: '' };
  } catch {
    // Never overwrite unreadable saved data automatically.
    return { decks: [], issue: 'read' };
  }
}
export const serializeDecks = decks => JSON.stringify({ version: 1, decks }, null, 2);
export const cloneImportedDecks = decks => decks.map(d => ({ ...d, id: newId(), cards: d.cards.map(c => ({ ...c, id: newId() })) }));

// Two or three tab-separated columns, no header. Quoted multiline TSV is intentionally rejected.
export function parseRows(text) {
  const cards = [], errors = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const cells = line.split('\t').map(v => v.trim());
    if (cells.length < 2 || cells.length > 3 || !validText(cells[0], 2000) || !validText(cells[1], 2000) || !validText(cells[2] ?? '', 4000, true)) errors.push(i + 1);
    else cards.push({ question: cells[0], answer: cells[1], explanation: cells[2] ?? '' });
  });
  return { cards, errors };
}

export function shuffled(cards) {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function lessonReducer(state, action) {
  const card = state.cards[state.index];
  switch (action.type) {
    case 'reveal': return { ...state, stage: Math.min(state.stage + 1, card.explanation ? 2 : 1) };
    case 'hide': return { ...state, stage: 0 };
    case 'next': return state.index + 1 < state.cards.length ? { ...state, index: state.index + 1, stage: 0 } : { ...state, done: true, stage: 0 };
    case 'previous': return { ...state, index: Math.max(0, state.index - 1), stage: 0, done: false };
    case 'mark': return { ...state, marked: state.marked.includes(card.id) ? state.marked.filter(id => id !== card.id) : [...state.marked, card.id] };
    case 'review': {
      const cards = state.cards.filter(c => state.marked.includes(c.id));
      return cards.length ? { cards, index: 0, stage: 0, marked: [], done: false, review: true } : state;
    }
    default: return state;
  }
}
