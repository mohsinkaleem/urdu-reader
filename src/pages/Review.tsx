import { useCallback, useEffect, useMemo, useState } from 'react';
import { TOPICS } from '../data/vocab';
import { SpeakButton } from '../components/SpeakButton';
import { useDeck } from '../lib/deck';
import { formatInterval, isDue, previewInterval, schedule, type Rating } from '../lib/srs';

const RATINGS: { id: Rating; label: string; key: string }[] = [
  { id: 'again', label: 'Again', key: '1' },
  { id: 'hard', label: 'Hard', key: '2' },
  { id: 'good', label: 'Good', key: '3' },
  { id: 'easy', label: 'Easy', key: '4' },
];

export function Review() {
  const { deck, rate } = useDeck();
  const [queue, setQueue] = useState<string[]>(() =>
    Object.values(deck)
      .filter((c) => isDue(c.srs))
      .sort((a, b) => a.srs.due - b.srs.due)
      .map((c) => c.urdu),
  );
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const current = queue[0] ? deck[queue[0]] : undefined;

  const answer = useCallback(
    (r: Rating) => {
      if (!current) return;
      const stillLearning = schedule(current.srs, r).interval === 0;
      rate(current.urdu, r);
      setReviewed((n) => n + 1);
      setRevealed(false);
      setQueue((q) => (stillLearning ? [...q.slice(1), q[0]] : q.slice(1)));
    },
    [current, rate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        const r = RATINGS.find((x) => x.key === e.key);
        if (r) answer(r.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, revealed, answer]);

  const nextDue = useMemo(() => {
    const times = Object.values(deck).map((c) => c.srs.due).filter((t) => t > Date.now());
    return times.length ? Math.min(...times) : undefined;
  }, [deck]);

  if (!current) {
    const empty = Object.keys(deck).length === 0;
    return (
      <div className="page center">
        <div className="done-card">
          <p className="urdu done-urdu">{empty ? 'شروع کریں' : 'شاباش!'}</p>
          <h1>{empty ? 'Your deck is empty' : reviewed ? `Done: ${reviewed} reviews` : 'Nothing due right now'}</h1>
          <p className="muted">
            {empty
              ? 'Add words from the word bank, or tap words while reading a passage.'
              : nextDue
                ? `Next card is due ${describeWhen(nextDue)}.`
                : ''}
          </p>
          <div className="row center-row">
            <a className="btn btn-primary" href="#/read">Read a passage</a>
            <a className="btn btn-soft" href="#/words">Word bank</a>
          </div>
        </div>
      </div>
    );
  }

  const topic = TOPICS.find((t) => t.id === current.topic);

  return (
    <div className="page review">
      <div className="review-meta">
        <span>{queue.length} left</span>
        <span>{topic ? topic.english : current.source}</span>
      </div>

      <div className={`flashcard ${revealed ? 'is-revealed' : ''}`} onClick={() => setRevealed(true)}>
        <p className="urdu flash-urdu">{current.urdu}</p>
        {revealed ? (
          <div className="flash-back">
            <p className="flash-roman">{current.roman}</p>
            <p className="flash-english">{current.english}</p>
            <SpeakButton text={current.urdu} size="lg" />
          </div>
        ) : (
          <p className="muted hint">Read it aloud, recall the meaning, then tap to reveal</p>
        )}
      </div>

      {revealed ? (
        <div className="ratings">
          {RATINGS.map((r) => (
            <button key={r.id} className={`rating rating-${r.id}`} onClick={() => answer(r.id)}>
              <span className="rating-label">{r.label}</span>
              <span className="rating-when">{previewInterval(current.srs, r.id)}</span>
            </button>
          ))}
        </div>
      ) : (
        <button className="btn btn-primary wide" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      )}
      <p className="muted small kbd-hint">Keyboard: Space to reveal, 1–4 to rate</p>
    </div>
  );
}

function describeWhen(t: number): string {
  const diff = t - Date.now();
  if (diff < 60 * 60_000) return `in ${Math.max(1, Math.round(diff / 60_000))} min`;
  const days = Math.ceil(diff / 86_400_000);
  if (days <= 1) return 'tomorrow';
  return `in ${formatInterval(days)}`;
}
