import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Word } from '../data/vocab';
import { newState, schedule, type Rating, type SrsState } from './srs';

export type Card = Word & { source: string; addedAt: number; srs: SrsState };
export type Deck = Record<string, Card>;

const KEY = 'urdu-practice:deck:v1';

function load(): Deck {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Deck) : {};
  } catch {
    return {};
  }
}

function save(deck: Deck) {
  try {
    localStorage.setItem(KEY, JSON.stringify(deck));
  } catch {
    /* storage unavailable: progress only lasts this session */
  }
}

type DeckApi = {
  deck: Deck;
  has: (urdu: string) => boolean;
  add: (word: Word, source: string) => void;
  addMany: (words: Word[], source: string) => void;
  remove: (urdu: string) => void;
  rate: (urdu: string, rating: Rating) => void;
};

const DeckContext = createContext<DeckApi | null>(null);

export function DeckProvider({ children }: { children: ReactNode }) {
  const [deck, setDeck] = useState<Deck>(load);

  useEffect(() => save(deck), [deck]);

  const addMany = useCallback((words: Word[], source: string) => {
    setDeck((d) => {
      const next = { ...d };
      const now = Date.now();
      for (const w of words) {
        if (next[w.urdu]) continue;
        next[w.urdu] = { urdu: w.urdu, roman: w.roman, english: w.english, topic: w.topic, source, addedAt: now, srs: newState(now) };
      }
      return next;
    });
  }, []);

  const api = useMemo<DeckApi>(
    () => ({
      deck,
      has: (urdu) => urdu in deck,
      add: (word, source) => addMany([word], source),
      addMany,
      remove: (urdu) =>
        setDeck((d) => {
          const next = { ...d };
          delete next[urdu];
          return next;
        }),
      rate: (urdu, rating) =>
        setDeck((d) => (d[urdu] ? { ...d, [urdu]: { ...d[urdu], srs: schedule(d[urdu].srs, rating) } } : d)),
    }),
    [deck, addMany],
  );

  return <DeckContext.Provider value={api}>{children}</DeckContext.Provider>;
}

export function useDeck(): DeckApi {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error('useDeck must be used inside DeckProvider');
  return ctx;
}
