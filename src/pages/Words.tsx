import { useMemo, useState } from 'react';
import { TOPICS, VOCAB, type TopicId, type Word } from '../data/vocab';
import { AddButton } from '../components/AddButton';
import { SpeakButton } from '../components/SpeakButton';
import { useDeck } from '../lib/deck';
import { formatInterval, isDue } from '../lib/srs';

type Tab = TopicId | 'deck';

export function Words({ initialTab }: { initialTab?: string }) {
  const { deck, addMany } = useDeck();
  const [tab, setTab] = useState<Tab>(
    initialTab === 'deck' || TOPICS.some((t) => t.id === initialTab) ? (initialTab as Tab) : 'everyday',
  );
  const [q, setQ] = useState('');

  const words: Word[] = useMemo(() => {
    const base = tab === 'deck' ? Object.values(deck).sort((a, b) => a.srs.due - b.srs.due) : VOCAB.filter((w) => w.topic === tab);
    const needle = q.trim().toLowerCase();
    if (!needle) return base;
    return base.filter(
      (w) => w.urdu.includes(needle) || w.roman.toLowerCase().includes(needle) || w.english.toLowerCase().includes(needle),
    );
  }, [tab, deck, q]);

  const topic = TOPICS.find((t) => t.id === tab);
  const notInDeck = tab === 'deck' ? [] : words.filter((w) => !deck[w.urdu]);
  const deckCount = Object.keys(deck).length;

  return (
    <div className="page">
      <header className="page-head">
        <p className="urdu page-urdu">ذخیرۂ الفاظ</p>
        <h1>Word bank</h1>
      </header>

      <div className="tabs" role="tablist">
        {TOPICS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.english}
          </button>
        ))}
        <button role="tab" aria-selected={tab === 'deck'} className={tab === 'deck' ? 'active' : ''} onClick={() => setTab('deck')}>
          My deck ({deckCount})
        </button>
      </div>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search Urdu, Roman or English…" value={q} onChange={(e) => setQ(e.target.value)} />
        {topic && notInDeck.length > 0 && (
          <button className="btn btn-primary" onClick={() => addMany(notInDeck, topic.english)}>
            + Add {notInDeck.length} to deck
          </button>
        )}
      </div>
      {topic && <p className="muted small topic-blurb"><span className="urdu">{topic.urdu}</span> · {topic.blurb}</p>}

      {words.length === 0 ? (
        <p className="muted empty">
          {tab === 'deck' && !q ? 'No words yet. Add some from a topic, or tap words while reading.' : 'No matches.'}
        </p>
      ) : (
        <ul className="word-list">
          {words.map((w) => {
            const card = deck[w.urdu];
            return (
              <li key={w.urdu} className="word-row">
                <span className="urdu word-urdu">{w.urdu}</span>
                <span className="word-text">
                  <span className="word-roman">{w.roman}</span>
                  <span className="word-en">{w.english}</span>
                  {tab === 'deck' && card && (
                    <span className="muted small">
                      {isDue(card.srs)
                        ? 'Due now'
                        : card.srs.interval === 0
                          ? 'Due again shortly'
                          : `Next in ${formatInterval(Math.max(1, Math.ceil((card.srs.due - Date.now()) / 86_400_000)))}`}
                      {' · '}from {card.source}
                    </span>
                  )}
                </span>
                <span className="word-actions">
                  <SpeakButton text={w.urdu} size="sm" />
                  <AddButton word={w} source={topic?.english ?? 'Word bank'} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
