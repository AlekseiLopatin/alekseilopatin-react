import engine from './engine';
import heroes from './heroes';
import { withChoices } from './curriculum';

export const statuses = ['unmarked', 'correct', 'attempt', 'none'];
export function createBatch(students, topic, difficulty, format = 'written', number = 1) {
  const questions = [], seen = new Set();
  for (let i = 0; i < 5; i++) {
    let q;
    for (let tries = 0; tries < 30; tries++) {
      q = engine.createQuestion(topic, difficulty);
      const key = JSON.stringify(q);
      if (!seen.has(key)) { seen.add(key); break; }
    }
    questions.push(format === 'choice' && q.kind === 'practice' ? withChoices(q) : q);
  }
  const present = students.flatMap((s, i) => s.present ? [i] : []);
  // Rotate checking partners between rounds; no student checks their own work.
  const offset = present.length > 1 ? 1 + ((number - 1) % (present.length - 1)) : 0;
  const checkers = students.map(() => null);
  if (offset) present.forEach((id, i) => { checkers[id] = present[(i + offset) % present.length]; });
  return { number, topic, difficulty, format, questions, phase: 'solve', index: 0,
    revealed: [false, false, false, false, false], leader: null, checkers,
    results: students.map(s => Array(5).fill(s.present ? 'unmarked' : 'absent')), gains: null };
}
export function ready(batch) {
  return batch?.phase === 'review' && batch.revealed.every(Boolean) && batch.results.every(row => row.every(s => s !== 'unmarked'));
}
export function gain(row, leader = false) { return row.reduce((sum, s) => sum + ({ correct: 10, attempt: 3 }[s] || 0), 0) * (leader ? 2 : 1); }
export function awardBatch(group) {
  const b = group.batch;
  if (!ready(b)) return false;
  group.batchUndo = { batch: structuredClone(b), students: structuredClone(group.students), skills: structuredClone(group.skills || {}) };
  group.undo = null;
  group.skills ||= {};
  b.gains = group.students.map((s, i) => {
    const value = gain(b.results[i], b.leader === i); s.xp += value;
    if (b.leader === i) s.turns++;
    b.questions.forEach((q, j) => {
      const status = b.results[i][j];
      if (status === 'absent') return;
      const key = q.topic, rows = group.skills[key] ||= Array.from({ length: 30 }, () => ({ correct: 0, attempt: 0, none: 0 }));
      rows[i][status]++;
    });
    return value;
  });
  b.phase = 'awarded'; return true;
}
export function undoBatch(group) {
  if (!group.batchUndo) return false;
  const old = group.batchUndo;
  old.students.forEach((s, i) => { s.appearance = heroes.sanitize(group.students[i].appearance, s.xp, i); });
  group.students = old.students; group.batch = old.batch; group.skills = old.skills;
  group.batchUndo = null; return true;
}
export function recommendations(group) {
  return Object.entries(group.skills || {}).map(([topic, rows]) => {
    const totals = rows.reduce((a, r) => ({ correct: a.correct + r.correct, total: a.total + r.correct + r.attempt + r.none }), { correct: 0, total: 0 });
    return { topic, ...totals };
  }).filter(r => r.total > 0).sort((a, b) => a.correct / a.total - b.correct / b.total);
}
