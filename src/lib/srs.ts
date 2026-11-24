export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type SrsState = {
  ease: number;
  /** Interval in days. 0 means "learning" (due again within the session). */
  interval: number;
  reps: number;
  lapses: number;
  /** Epoch ms when the card is next due. */
  due: number;
};

export const DAY = 86_400_000;
const MIN_EASE = 1.3;

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function newState(now = Date.now()): SrsState {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now };
}

/** Simplified SM-2 scheduling. */
export function schedule(s: SrsState, rating: Rating, now = Date.now()): SrsState {
  let { ease, interval } = s;
  const { reps, lapses } = s;

  if (rating === 'again') {
    return {
      ease: Math.max(MIN_EASE, ease - 0.2),
      interval: 0,
      reps: 0,
      lapses: reps > 0 ? lapses + 1 : lapses,
      due: now + 60_000,
    };
  }

  if (rating === 'hard' && reps === 0) {
    // Still learning: show it again later in this session, without an ease penalty.
    return { ease, interval: 0, reps, lapses, due: now + 5 * 60_000 };
  }

  if (rating === 'hard') {
    interval = Math.max(interval + 1, Math.round(interval * 1.2));
    ease = Math.max(MIN_EASE, ease - 0.15);
  } else if (rating === 'good') {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(interval + 1, Math.round(interval * ease));
  } else {
    interval = reps === 0 ? 4 : reps === 1 ? 6 : Math.max(interval + 1, Math.round(interval * ease * 1.3));
    ease += 0.15;
  }

  return { ease, interval, reps: reps + 1, lapses, due: startOfDay(now) + interval * DAY };
}

export function isDue(s: SrsState, now = Date.now()): boolean {
  return s.due <= now;
}

export function formatInterval(days: number): string {
  if (days <= 0) return 'soon';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo`;
  return `${(days / 365).toFixed(1)} yr`;
}

export function previewInterval(s: SrsState, rating: Rating, now = Date.now()): string {
  const next = schedule(s, rating, now);
  if (next.interval === 0) return `${Math.round((next.due - now) / 60_000)} min`;
  return formatInterval(next.interval);
}
