import { describe, expect, it } from 'vitest';
import { DAY, newState, schedule, startOfDay } from './srs';

const now = new Date(2026, 10, 23, 10, 0).getTime();

describe('schedule', () => {
  it('new card rated good is due tomorrow at midnight', () => {
    const s = schedule(newState(now), 'good', now);
    expect(s.interval).toBe(1);
    expect(s.due).toBe(startOfDay(now) + DAY);
  });

  it('again sends the card back within the session and lowers ease', () => {
    const learned = schedule(schedule(newState(now), 'good', now), 'good', now);
    const s = schedule(learned, 'again', now);
    expect(s.interval).toBe(0);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeCloseTo(2.3);
    expect(s.due).toBe(now + 60_000);
  });

  it('hard on a new card keeps it in the session without an ease penalty', () => {
    const s = schedule(newState(now), 'hard', now);
    expect(s.interval).toBe(0);
    expect(s.ease).toBe(2.5);
    expect(s.due).toBe(now + 5 * 60_000);
  });

  it('intervals grow with repeated good answers', () => {
    let s = newState(now);
    const intervals: number[] = [];
    for (let i = 0; i < 4; i++) {
      s = schedule(s, 'good', now);
      intervals.push(s.interval);
    }
    expect(intervals).toEqual([1, 3, 8, 20]);
  });

  it('easy beats good, which beats hard', () => {
    const base = schedule(schedule(newState(now), 'good', now), 'good', now);
    const [h, g, e] = (['hard', 'good', 'easy'] as const).map((r) => schedule(base, r, now).interval);
    expect(h).toBeLessThan(g);
    expect(g).toBeLessThan(e);
  });
});
