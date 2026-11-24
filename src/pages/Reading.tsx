import { Fragment, useEffect, useMemo, useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';
import { CATEGORIES, COMMON_GLOSSARY, PASSAGES, PASSAGE_BY_ID, TAG_BY_ID, authorOf, type Passage } from '../data/library';
import type { Word } from '../data/vocab';
import { AddButton } from '../components/AddButton';
import { SpeakButton } from '../components/SpeakButton';
import { useDeck } from '../lib/deck';
import { useProgress } from '../lib/progress';
import { useLocalState, useSessionState } from '../lib/storage';
import { lookup, romanize, tokenize } from '../lib/tokenize';

type Selected = { key: string; word: Word };

/** Steps for the reader's A− / A+ control, as a multiple of the normal Urdu text size. */
const TEXT_SIZES = [0.85, 1, 1.15, 1.3, 1.5];

export function Reader({ id }: { id: string }) {
  const passage = PASSAGE_BY_ID.get(id);
  if (!passage) {
    return (
      <div className="page">
        <p>Passage not found.</p>
        <a href="#/read">Back to the library</a>
      </div>
    );
  }
  return <PassageView key={passage.id} passage={passage} />;
}

function seriesNeighbour(p: Passage, delta: number): Passage | undefined {
  if (!p.series) return undefined;
  return PASSAGES.find((x) => x.series?.id === p.series!.id && x.series.part === p.series!.part + delta);
}

function PassageView({ passage }: { passage: Passage }) {
  const { has } = useDeck();
  const { progress, update } = useProgress();
  const [selected, setSelected] = useState<Selected | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showRoman, setShowRoman] = useLocalState('urdu-practice:reader:roman', false);
  const [textSize, setTextSize] = useLocalState('urdu-practice:reader:size', 1);
  const sizeStep = Math.max(0, TEXT_SIZES.indexOf(textSize));
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [explained, setExplained] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [lookedUp, setLookedUp] = useSessionState<Word[]>(`lookups:${passage.id}`, []);

  const tokenized = useMemo(() => passage.sentences.map((s) => tokenize(s.urdu)), [passage]);
  const romans = useMemo(() => tokenized.map((t) => romanize(t, passage.glossary)), [tokenized, passage]);

  const select = (key: string, word: Word) => {
    setSelected({ key, word });
    // Common function words (hai, ka, ki…) are not worth a card of their own.
    if (!(word.urdu in COMMON_GLOSSARY)) {
      setLookedUp((prev) => (prev.some((w) => w.urdu === word.urdu) ? prev : [...prev, word]));
    }
  };
  const category = CATEGORIES.find((c) => c.id === passage.category);
  const byline = [authorOf(passage), ...(passage.tags ?? []).map((t) => TAG_BY_ID.get(t)?.english)].filter(Boolean).join(' · ');
  const isRead = !!progress[passage.id]?.read;
  const prev = seriesNeighbour(passage, -1);
  const next =
    seriesNeighbour(passage, 1) ??
    PASSAGES.find(
      (p) =>
        p.category === passage.category &&
        p.id !== passage.id &&
        !progress[p.id]?.read &&
        (!p.series || (p.series.part === 1 && p.series.id !== passage.series?.id)),
    );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const answeredAll = Object.keys(answers).length === passage.questions.length;
  const score = passage.questions.filter((q, i) => answers[i] === q.answer).length;

  useEffect(() => {
    if (answeredAll) update(passage.id, { read: true, score, readAt: Date.now() });
  }, [answeredAll, score, passage.id, update]);

  const toggle = (set: Dispatch<SetStateAction<Set<number>>>, i: number) =>
    set((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const { source } = passage;

  return (
    <div
      className="page reader"
      style={{ '--urdu-scale': TEXT_SIZES[sizeStep] } as CSSProperties}
      onClick={() => setSelected(null)}
    >
      <a href="#/read" className="back">← Library</a>
      <header className="page-head">
        <p className="urdu page-urdu">{passage.title.urdu}</p>
        <h1>{passage.title.english}</h1>
        <div className="passage-card-meta reader-meta">
          <span className={`level level-${passage.level}`}>{passage.level}</span>
          <span className="chip">{category?.english}</span>
          {passage.series && (
            <span className="muted small">
              {passage.series.title} · Part {passage.series.part} of {passage.series.of}
            </span>
          )}
          {byline && <span className="muted small">{byline}</span>}
        </div>
        {passage.intro && <p className="intro">{passage.intro}</p>}
      </header>

      <div className="reader-toolbar" onClick={(e) => e.stopPropagation()}>
        <label className="toggle">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Translations
        </label>
        <label className="toggle">
          <input type="checkbox" checked={showRoman} onChange={(e) => setShowRoman(e.target.checked)} />
          Roman Urdu
        </label>
        <span className="toolbar-spacer" />
        <div className="text-size" role="group" aria-label="Urdu text size">
          <button
            className="size-btn"
            onClick={() => setTextSize(TEXT_SIZES[sizeStep - 1])}
            disabled={sizeStep === 0}
            aria-label="Smaller Urdu text"
            title="Smaller Urdu text"
          >
            A−
          </button>
          <span className="size-value">{Math.round(TEXT_SIZES[sizeStep] * 100)}%</span>
          <button
            className="size-btn size-btn-lg"
            onClick={() => setTextSize(TEXT_SIZES[sizeStep + 1])}
            disabled={sizeStep === TEXT_SIZES.length - 1}
            aria-label="Larger Urdu text"
            title="Larger Urdu text"
          >
            A+
          </button>
        </div>
        <SpeakButton text={passage.sentences.map((s) => s.urdu).join(' ')} />
      </div>

      <article className="passage">
        {passage.sentences.map((s, i) => (
          <div key={i} className={`sentence ${s.verse ? 'verse' : ''} ${s.verse && passage.sentences[i + 1]?.verse && !s.explanation ? 'verse-first' : ''}`}>
            <p className="urdu sentence-urdu" dir="rtl">
              {tokenized[i].map((t, j) => {
                const key = `${i}-${j}`;
                const word = lookup(t.word, passage.glossary);
                return (
                  <Fragment key={key}>
                    {t.lead}
                    {word ? (
                      <span
                        role="button"
                        tabIndex={0}
                        className={`tok ${selected?.key === key ? 'tok-active' : ''} ${has(word.urdu) ? 'tok-deck' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          select(key, word);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            select(key, word);
                          }
                        }}
                      >
                        {t.word}
                      </span>
                    ) : (
                      t.word
                    )}
                    {t.trail}{' '}
                  </Fragment>
                );
              })}
            </p>
            {showRoman && (
              <p className="sentence-roman">
                {romans[i].map((t, j) => (
                  <Fragment key={j}>
                    {j > 0 && ' '}
                    {t.lead}
                    {t.ambiguous ? (
                      <span className="roman-alt" title="Same spelling, more than one reading: the context decides">
                        {t.roman}
                      </span>
                    ) : (
                      t.roman
                    )}
                    {t.trail}
                  </Fragment>
                ))}
              </p>
            )}
            <div className="sentence-tools">
              <SpeakButton text={s.urdu} size="sm" />
              <button
                className="link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(setShown, i);
                }}
              >
                {showAll || shown.has(i) ? 'Hide' : 'Translate'}
              </button>
              {s.explanation && (
                <button
                  className="link-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(setExplained, i);
                  }}
                >
                  {explained.has(i) ? 'Hide explanation' : 'Explain'}
                </button>
              )}
            </div>
            {(showAll || shown.has(i)) && <p className="sentence-en">{s.english}</p>}
            {s.explanation && explained.has(i) && (
              <div className="explanation">
                <p className="urdu" dir="rtl">{s.explanation.urdu}</p>
                <p className="explanation-en">{s.explanation.english}</p>
              </div>
            )}
          </div>
        ))}
      </article>

      <p className="source-line small muted">
        Source:{' '}
        {source.url ? (
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.name}
          </a>
        ) : (
          source.name
        )}
        {source.author ? ` · ${source.author}` : ''}
        {source.license ? ` · ${source.license}` : ''}
      </p>

      <LookedUpWords words={lookedUp} source={passage.title.english} />

      <section className="quiz" onClick={(e) => e.stopPropagation()}>
        <h2>Check your understanding</h2>
        {passage.questions.map((q, qi) => {
          const picked = answers[qi];
          return (
            <div key={qi} className="question">
              <p className="urdu q-urdu" dir="rtl">{q.urdu}</p>
              <p className="muted small">{q.english}</p>
              <div className="options">
                {q.options.map((o, oi) => {
                  const state =
                    picked === undefined ? '' : oi === q.answer ? 'opt-correct' : oi === picked ? 'opt-wrong' : 'opt-dim';
                  return (
                    <button
                      key={oi}
                      className={`option ${state}`}
                      disabled={picked !== undefined}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    >
                      <span className="urdu opt-urdu">{o.urdu}</span>
                      {picked !== undefined && <span className="opt-en">{o.english}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {answeredAll && (
          <div className="quiz-result">
            <strong>
              {score}/{passage.questions.length} correct
            </strong>
            <button className="btn btn-soft" onClick={() => setAnswers({})}>
              Try again
            </button>
          </div>
        )}
      </section>

      <nav className="reader-nav" onClick={(e) => e.stopPropagation()}>
        {prev ? (
          <a className="btn btn-ghost" href={`#/read/${prev.id}`}>← Part {prev.series!.part}</a>
        ) : (
          <span />
        )}
        <button className="btn btn-ghost" onClick={() => update(passage.id, { read: !isRead, readAt: Date.now() })}>
          {isRead ? '✓ Read · mark unread' : 'Mark as read'}
        </button>
        {next ? (
          <a className="btn btn-primary" href={`#/read/${next.id}`}>
            {next.series && next.series.id === passage.series?.id ? `Part ${next.series.part} →` : 'Next passage →'}
          </a>
        ) : (
          <span />
        )}
      </nav>

      {selected && (
        <div className="word-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Word details">
          <button className="icon-btn close" aria-label="Close" onClick={() => setSelected(null)}>
            ×
          </button>
          <p className="urdu sheet-urdu">{selected.word.urdu}</p>
          <p className="sheet-roman">{selected.word.roman}</p>
          <p className="sheet-en">{selected.word.english}</p>
          <div className="row center-row">
            <SpeakButton text={selected.word.urdu} />
            <AddButton word={selected.word} source={passage.title.english} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Words tapped while reading this passage, offered as one batch for the review deck. */
function LookedUpWords({ words, source }: { words: Word[]; source: string }) {
  const { deck, addMany } = useDeck();
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(0);

  if (words.length === 0) return null;

  const fresh = words.filter((w) => !(w.urdu in deck));
  const picked = fresh.filter((w) => !skipped.has(w.urdu));
  const inDeck = words.length - fresh.length - added;
  const plural = (n: number) => `${n} word${n === 1 ? '' : 's'}`;

  const toggle = (urdu: string) =>
    setSkipped((s) => {
      const n = new Set(s);
      if (n.has(urdu)) n.delete(urdu);
      else n.add(urdu);
      return n;
    });

  return (
    <section className="lookups" onClick={(e) => e.stopPropagation()}>
      <h2>Words you looked up</h2>
      {added > 0 && <p className="lookups-done">✓ Added {plural(added)} to your deck. They’ll come up in Review.</p>}
      {fresh.length > 0 ? (
        <>
          <p className="muted small">
            Untick any you already know, then add the rest to your review deck.
            {inDeck > 0 && ` ${plural(inDeck)} you tapped ${inDeck === 1 ? 'is' : 'are'} already in it.`}
          </p>
          <ul className="lookup-list">
            {fresh.map((w) => (
              <li key={w.urdu}>
                <label className="lookup-row">
                  <input type="checkbox" checked={!skipped.has(w.urdu)} onChange={() => toggle(w.urdu)} />
                  <span className="urdu lookup-urdu" dir="rtl">{w.urdu}</span>
                  <span className="lookup-roman">{w.roman}</span>
                  <span className="lookup-en">{w.english}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary"
            disabled={picked.length === 0}
            onClick={() => {
              addMany(picked, source);
              setAdded((n) => n + picked.length);
            }}
          >
            {picked.length > 0 ? `+ Add ${plural(picked.length)} to deck` : 'Tick a word to add it'}
          </button>
        </>
      ) : (
        added === 0 && (
          <p className="muted small">All {plural(words.length)} you tapped are already in your deck.</p>
        )
      )}
    </section>
  );
}
