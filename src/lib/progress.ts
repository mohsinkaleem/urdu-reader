import { useCallback, useEffect, useState } from 'react';

export type PassageProgress = { read?: boolean; score?: number; readAt?: number };
export type Progress = Record<string, PassageProgress>;

const KEY = 'urdu-practice:library:v1';
const EVENT = 'urdu-practice:progress';

/** Passages that were renamed; saved progress moves to the new id. */
const RENAMED: Record<string, string> = {
  bazaar: 'starter-bazaar',
  'pehla-din': 'starter-pehla-din',
  'shararati-billi': 'starter-shararati-billi',
  'baarish-khabar': 'starter-baarish-khabar',
  ghalib: 'poem-ghalib-hazaron-khwahishen',
};

function migrate(p: Progress): Progress {
  for (const [from, to] of Object.entries(RENAMED)) {
    if (p[from]) {
      p[to] = { ...p[from], ...p[to] };
      delete p[from];
    }
  }
  return p;
}

function load(): Progress {
  try {
    return migrate(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Progress);
  } catch {
    return {};
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    const sync = () => setProgress(load());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const update = useCallback((id: string, patch: PassageProgress) => {
    const all = load();
    all[id] = { ...all[id], ...patch };
    save(all);
  }, []);

  return { progress, update };
}
