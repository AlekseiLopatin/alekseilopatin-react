import { describe, it, expect, vi } from 'vitest';
import { demoDecks, validateDecks, serializeDecks, cloneImportedDecks, parseRows, readLibrary, STORAGE_KEY, lessonReducer, shuffled } from './model';

describe('math flashcard data', () => {
  it('round-trips content, including multiline maths, and gives imports independent IDs', () => {
    const decks = demoDecks();
    decks[0].cards[0].explanation = '1/2\n× 4 = 2';
    const parsed = validateDecks(JSON.parse(serializeDecks(decks)));
    expect(parsed).toEqual(decks);
    const copies = cloneImportedDecks(parsed);
    expect(copies[0].id).not.toBe(decks[0].id);
    expect(copies[0].cards[0].id).not.toBe(decks[0].cards[0].id);
    expect(copies[0].cards[0].explanation).toBe('1/2\n× 4 = 2');
  });
  it('rejects invalid schemas, duplicate ids, missing answers and excessive text', () => {
    expect(() => validateDecks({ version: 2, decks: [] })).toThrow();
    const decks = demoDecks();
    expect(() => validateDecks({ version: 1, decks: [decks[0], decks[0]] })).toThrow();
    decks[0].cards[0].answer = ' ';
    expect(() => validateDecks({ version: 1, decks })).toThrow();
    decks[0].cards[0].answer = 'x'.repeat(2001);
    expect(() => validateDecks({ version: 1, decks })).toThrow();
  });
  it('preserves an intentionally empty library and never overwrites a corrupt save', () => {
    localStorage.setItem(STORAGE_KEY, serializeDecks([]));
    expect(readLibrary().decks).toEqual([]);
    localStorage.setItem(STORAGE_KEY, 'broken');
    expect(readLibrary()).toEqual({ decks: [], issue: 'read' });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('broken');
  });
  it('handles blocked storage', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error(); });
    expect(readLibrary().issue).toBe('read');
    spy.mockRestore();
  });
  it('previews TSV rows without silently accepting missing columns or answers', () => {
    const result = parseRows('2 × 3\t6\t2 + 2 + 2\r\n\nBad\n1/2 + 1/2\t1\nQ\t\n');
    expect(result.cards).toHaveLength(2);
    expect(result.errors).toEqual([3, 5]);
    expect(parseRows('Q\tA\tE\textra').errors).toEqual([1]);
  });
  it('shuffles a copy without losing or changing cards', () => {
    const cards = demoDecks()[0].cards;
    const original = [...cards];
    expect(shuffled(cards).map(c => c.id).sort()).toEqual(cards.map(c => c.id).sort());
    expect(cards).toEqual(original);
  });
});

describe('lesson progression', () => {
  const start = () => ({ cards: demoDecks()[0].cards, index: 0, stage: 0, marked: [], done: false, review: false });
  it('reveals answers then explanations and hides both on every navigation', () => {
    let s = start();
    s = lessonReducer(s, { type: 'reveal' }); expect(s.stage).toBe(1);
    s = lessonReducer(s, { type: 'reveal' }); expect(s.stage).toBe(2);
    s = lessonReducer(s, { type: 'next' }); expect(s.stage).toBe(0); expect(s.index).toBe(1);
    s = lessonReducer(s, { type: 'previous' }); expect(s.stage).toBe(0); expect(s.index).toBe(0);
  });
  it('reviews only marked cards, once each, and ends with no review when none remain', () => {
    let s = start(); const id = s.cards[0].id;
    s = lessonReducer(s, { type: 'mark' });
    for (let i = 0; i < 3; i++) s = lessonReducer(s, { type: 'next' });
    expect(s.done).toBe(true);
    s = lessonReducer(s, { type: 'review' });
    expect(s.cards.map(c => c.id)).toEqual([id]); expect(s.stage).toBe(0); expect(s.marked).toEqual([]);
    s = lessonReducer(s, { type: 'next' }); expect(s.done).toBe(true);
    expect(lessonReducer(s, { type: 'review' })).toBe(s);
  });
});
