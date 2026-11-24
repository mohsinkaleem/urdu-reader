import { CATEGORIES, PASSAGES } from '../data/library';
import { TOPICS, VOCAB } from '../data/vocab';
import { useDeck } from '../lib/deck';
import { useSpeech } from '../lib/speech';

export function Home({ due }: { due: number }) {
  const { deck } = useDeck();
  const { available } = useSpeech();
  const total = Object.keys(deck).length;
  const learned = Object.values(deck).filter((c) => c.srs.interval >= 21).length;

  return (
    <div className="page">
      <section className="hero">
        <p className="urdu hero-urdu">خوش آمدید</p>
        <h1>Welcome back</h1>
        <p className="muted">Read real Urdu in Nastaliq, tap the words you don’t know, and review them until they stick.</p>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">{due}</span>
          <span className="stat-label">due for review</span>
        </div>
        <div className="stat">
          <span className="stat-num">{total}</span>
          <span className="stat-label">words in your deck</span>
        </div>
        <div className="stat">
          <span className="stat-num">{learned}</span>
          <span className="stat-label">mature (3+ weeks)</span>
        </div>
      </section>

      <section className="tiles">
        <a className="tile tile-primary" href="#/review">
          <span className="urdu tile-urdu">دہرائی</span>
          <h2>Review</h2>
          <p>
            {due > 0
              ? `${due} card${due === 1 ? '' : 's'} waiting. Read the Urdu, then check yourself.`
              : total === 0
                ? 'Your deck is empty. Add words from the word bank or while reading.'
                : 'All caught up. Come back later for the next batch.'}
          </p>
        </a>
        <a className="tile" href="#/read">
          <span className="urdu tile-urdu">کتب خانہ</span>
          <h2>Library</h2>
          <p>
            {PASSAGES.length} passages: {CATEGORIES.map((c) => c.english.toLowerCase()).join(', ')}.
          </p>
        </a>
        <a className="tile" href="#/words">
          <span className="urdu tile-urdu">ذخیرۂ الفاظ</span>
          <h2>Word bank</h2>
          <p>
            {VOCAB.length} words across {TOPICS.length} topics. Add a whole topic or pick words one by one.
          </p>
        </a>
      </section>

      {!available && (
        <p className="notice">
          <strong>Audio is off:</strong> this browser has no Urdu voice. Microsoft Edge includes Urdu (Pakistan)
          voices; on Android, add Urdu in Google Text-to-speech settings. Everything else works without it.
        </p>
      )}
    </div>
  );
}
