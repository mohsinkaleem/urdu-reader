import { useState, type SetStateAction } from 'react';

function useStoredState<T>(storage: () => Storage, key: string, initial: T): [T, (v: SetStateAction<T>) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = storage().getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = (next: SetStateAction<T>) =>
    setV((prev) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      try {
        storage().setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable */
      }
      return value;
    });
  return [v, set];
}

/** Lasts until the tab closes: library filters, words looked up in a passage. */
export const useSessionState = <T,>(key: string, initial: T) => useStoredState(() => sessionStorage, key, initial);

/** Remembered across visits: reader and theme preferences. */
export const useLocalState = <T,>(key: string, initial: T) => useStoredState(() => localStorage, key, initial);
