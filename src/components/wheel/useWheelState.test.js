import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULTS, useWheelState } from './useWheelState';

const LS_KEY = 'student-picker-v1';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('useWheelState', () => {
  it('starts with the real class rosters and grade 0 selected', () => {
    const { result } = renderHook(() => useWheelState());

    expect(result.current.state.grades).toHaveLength(DEFAULTS.length);
    expect(result.current.grade.label).toBe(DEFAULTS[0].label);
    expect(result.current.pool).toHaveLength(DEFAULTS[0].names.length);
  });

  it('marking a name picked removes it from the pool, not from names', () => {
    const { result } = renderHook(() => useWheelState());
    const someone = result.current.pool[0];

    act(() => result.current.markPicked(someone));

    expect(result.current.pool).not.toContain(someone);
    expect(result.current.grade.names).toContain(someone);
    expect(result.current.grade.picked).toContain(someone);
  });

  it('unmarking returns a name to the pool', () => {
    const { result } = renderHook(() => useWheelState());
    const someone = result.current.pool[0];

    act(() => result.current.markPicked(someone));
    act(() => result.current.unmarkPicked(someone));

    expect(result.current.pool).toContain(someone);
    expect(result.current.grade.picked).not.toContain(someone);
  });

  it('resetPool clears picked without touching other grades', () => {
    const { result } = renderHook(() => useWheelState());
    act(() => result.current.markPicked(result.current.pool[0]));
    act(() => result.current.setCurrent(1));
    act(() => result.current.markPicked(result.current.pool[0]));

    act(() => result.current.setCurrent(0));
    act(() => result.current.resetPool());
    expect(result.current.grade.picked).toEqual([]);

    act(() => result.current.setCurrent(1));
    expect(result.current.grade.picked).toHaveLength(1);
  });

  it('switching grades keeps each pool independent', () => {
    const { result } = renderHook(() => useWheelState());
    act(() => result.current.setCurrent(2));
    expect(result.current.grade.label).toBe(DEFAULTS[2].label);
    expect(result.current.pool).toHaveLength(DEFAULTS[2].names.length);
  });

  it('saveEdits replaces the roster and dedupes, dropping stale picks', () => {
    const { result } = renderHook(() => useWheelState());
    const picked = result.current.pool[0];
    act(() => result.current.markPicked(picked));

    act(() => result.current.saveEdits('Test Grade', ['Ann', 'Bob', 'Ann']));

    expect(result.current.grade.label).toBe('Test Grade');
    expect(result.current.grade.names).toEqual(['Ann', 'Bob']);
    /* Ученик, отмеченный в старом составе, не мог остаться отмеченным
       в новом — его там больше нет. */
    expect(result.current.grade.picked).not.toContain(picked);
  });

  it('persists to localStorage and reloads the same state', () => {
    const { result, unmount } = renderHook(() => useWheelState());
    const someone = result.current.pool[0];
    act(() => result.current.markPicked(someone));
    unmount();

    const { result: reloaded } = renderHook(() => useWheelState());
    expect(reloaded.current.grade.picked).toContain(someone);
  });

  it('falls back to defaults when localStorage holds garbage', () => {
    localStorage.setItem(LS_KEY, '{not valid json');
    const { result } = renderHook(() => useWheelState());
    expect(result.current.state.grades).toHaveLength(DEFAULTS.length);
    expect(result.current.grade.picked).toEqual([]);
  });

  it('falls back to defaults when the stored shape does not match', () => {
    localStorage.setItem(LS_KEY, JSON.stringify({ grades: [{ label: 'X', names: [], picked: [] }] }));
    const { result } = renderHook(() => useWheelState());
    expect(result.current.state.grades).toHaveLength(DEFAULTS.length);
  });
});
