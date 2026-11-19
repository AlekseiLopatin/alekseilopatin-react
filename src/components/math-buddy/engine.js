import fractions from './fractions';
import practice from './practice';
import heroes from './heroes';

  'use strict';

  const topics = {...fractions.topics, ...practice.topics};
  const createQuestion = (topic, difficulty) => Object.hasOwn(practice.topics, topic) ? practice.createQuestion(topic, difficulty) : fractions.createQuestion(topic, difficulty);
  const newRound = (students, topic = 'simplify', difficulty = 'easy') => ({ phase: 'solve', topic, difficulty, question: createQuestion(topic, difficulty), leader: null, statuses: students.map(s => s.present ? 'correct' : 'absent'), gains: null });
  const createState = () => ({ version: 2, active: 0, classes: Array.from({length: 3}, (_, c) => {
    const students = Array.from({length: 30}, (_, i) => ({ name: `Student ${String(i + 1).padStart(2, '0')}`, xp: 0, present: true, turns: 0, appearance:heroes.defaultAppearance(i) }));
    return { name: `Class ${c + 1}`, students, round: newRound(students), roundNumber: 1, undo: null };
  }) });
  function award(group) {
    if (group.round.phase !== 'review') return false;
    group.undo = { students: structuredClone(group.students), round: structuredClone(group.round), roundNumber: group.roundNumber };
    group.round.gains = group.students.map((s, i) => {
      const base = s.present ? ({correct: 10, attempt: 3}[group.round.statuses[i]] || 0) : 0;
      const gain = base * (group.round.leader === i ? 2 : 1);
      s.xp += gain;
      if (s.present && group.round.leader === i) s.turns++;
      return gain;
    });
    group.round.phase = 'awarded'; return true;
  }
  function undo(group) {
    if (!group.undo) return false;
    // Keep customization made after an award, but remove equipment now locked.
    group.undo.students.forEach((student,i) => {
      student.appearance=heroes.sanitize(group.students[i].appearance,student.xp,i);
    });
    Object.assign(group, group.undo, { undo: null }); return true;
  }
  const api = { createState, createQuestion, newRound, award, undo, topics };
export default api;
