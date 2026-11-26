import { useEffect, useState } from 'react';
import { useDeck } from './lib/deck';
import { isDue } from './lib/srs';
import { useHashRoute } from './lib/router';
import { useTheme } from './lib/theme';
import { Home } from './pages/Home';
import { Review } from './pages/Review';
import { Library } from './pages/Library';
import { Reader } from './pages/Reading';
import { Words } from './pages/Words';

function useNow(ms = 30_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/** Icons for the phone tab bar. */
const NAV_ICONS: Record<string, JSX.Element> = {
  Home: icon('M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10'),
  Review: icon('M4 7h12v13H4zM8 7V4h12v13h-4'),
  Library: icon('M4 4h5v16H4zM10 4h4v16h-4zM15 5l4-1 3 15-4 1z'),
  Words: icon('M4 6h16M4 12h16M4 18h10'),
};

export function App() {
  const [page, arg] = useHashRoute();
  const { deck } = useDeck();
  const [theme, toggleTheme] = useTheme();
  const now = useNow();
  const due = Object.values(deck).filter((c) => isDue(c.srs, now)).length;

  const nav = [
    { href: '#/', id: undefined, label: 'Home' },
    { href: '#/review', id: 'review', label: 'Review', badge: due },
    { href: '#/read', id: 'read', label: 'Library' },
    { href: '#/words', id: 'words', label: 'Words' },
  ];

  let content;
  if (page === 'review') content = <Review />;
  else if (page === 'read' && arg) content = <Reader id={arg} />;
  else if (page === 'read') content = <Library />;
  else if (page === 'words') content = <Words initialTab={arg} />;
  else content = <Home due={due} />;

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand">
          <span className="urdu brand-mark">اردو</span>
          <span className="brand-text">Urdu Practice</span>
        </a>
        <nav className="topnav">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className={page === n.id ? 'active' : ''}>
              {n.label}
              {n.badge ? <span className="badge">{n.badge}</span> : null}
            </a>
          ))}
        </nav>
        <button
          className="icon-btn theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>
      </header>
      <main>{content}</main>
      <nav className="tabbar" aria-label="Main">
        {nav.map((n) => (
          <a key={n.href} href={n.href} className={page === n.id ? 'active' : ''} aria-current={page === n.id ? 'page' : undefined}>
            <span className="tabbar-icon">
              {NAV_ICONS[n.label]}
              {n.badge ? <span className="badge">{n.badge}</span> : null}
            </span>
            {n.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
