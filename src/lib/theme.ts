import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** Same key as the inline script in index.html, which sets the theme before first paint. */
const KEY = 'urdu-practice:theme';
const QUERY = '(prefers-color-scheme: dark)';

function stored(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'dark' || t === 'light' ? t : null;
  } catch {
    return null;
  }
}

/** Follows the system theme until the user picks one with the toggle. */
export function useTheme(): [Theme, () => void] {
  const [choice, setChoice] = useState<Theme | null>(stored);
  const [system, setSystem] = useState<Theme>(() => (window.matchMedia?.(QUERY).matches ? 'dark' : 'light'));

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme = choice ?? system;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: lasts this visit */
    }
    setChoice(next);
  };

  return [theme, toggle];
}
