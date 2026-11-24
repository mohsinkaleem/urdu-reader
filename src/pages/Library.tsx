import { useState } from 'react';
import {
  CATEGORIES,
  LEVELS,
  PASSAGES,
  TAGS,
  TAG_BY_ID,
  authorOf,
  seriesParts,
  seriesUrduTitle,
  type Category,
  type Level,
  type Passage,
  type Tag,
} from '../data/library';
import { useProgress, type Progress } from '../lib/progress';
import { useSessionState } from '../lib/storage';

type Filters = {
  category?: Category;
  level?: Level;
  status?: 'unread' | 'read';
  author?: string;
  topic?: Tag;
  form?: Tag;
};
type FacetKey = keyof Filters;
type Option = { value: string; label: string; count: number };

const isRead = (p: Passage, progress: Progress) => !!progress[p.id]?.read;

function matches(p: Passage, f: Filters, progress: Progress): boolean {
  return (
    (!f.category || p.category === f.category) &&
    (!f.level || p.level === f.level) &&
    (!f.status || (f.status === 'read') === isRead(p, progress)) &&
    (!f.author || authorOf(p) === f.author) &&
    (!f.topic || !!p.tags?.includes(f.topic)) &&
    (!f.form || !!p.tags?.includes(f.form))
  );
}

/** Poets and writers, most passages first. */
const AUTHORS = [...new Set(PASSAGES.map(authorOf).filter((a): a is string => !!a))].sort(
  (a, b) =>
    PASSAGES.filter((p) => authorOf(p) === b).length - PASSAGES.filter((p) => authorOf(p) === a).length ||
    a.localeCompare(b),
);

/** "Mirza Ghalib · Ghazal · Love" */
function byline(p: Passage): string {
  const tags = (p.tags ?? [])
    .slice()
    .sort((a, b) => (TAG_BY_ID.get(b)?.group === 'form' ? 1 : 0) - (TAG_BY_ID.get(a)?.group === 'form' ? 1 : 0))
    .map((t) => TAG_BY_ID.get(t)?.english);
  return [authorOf(p), ...tags].filter(Boolean).join(' · ');
}

type Item = { kind: 'passage'; passage: Passage } | { kind: 'series'; id: string; matching: Passage[] };

/** One card per passage, except that the parts of a series share one card. */
function group(list: Passage[]): Item[] {
  const items: Item[] = [];
  const series = new Map<string, Passage[]>();
  for (const p of list) {
    if (!p.series) {
      items.push({ kind: 'passage', passage: p });
    } else if (series.has(p.series.id)) {
      series.get(p.series.id)!.push(p);
    } else {
      const matching = [p];
      series.set(p.series.id, matching);
      items.push({ kind: 'series', id: p.series.id, matching });
    }
  }
  return items;
}

export function Library() {
  const { progress } = useProgress();
  const [filters, setFilters] = useSessionState<Filters>('lib:filters', {});

  const list = PASSAGES.filter((p) => matches(p, filters, progress));
  const items = group(list);
  const readCount = PASSAGES.filter((p) => isRead(p, progress)).length;

  const set = (key: FacetKey, value?: string) => setFilters((f) => ({ ...f, [key]: value }));
  /** How many passages there would be if this facet were set to `value`, keeping the other filters. */
  const options = (key: FacetKey, values: { value: string; label: string }[]): Option[] =>
    values.map((v) => ({
      ...v,
      count: PASSAGES.filter((p) => matches(p, { ...filters, [key]: v.value }, progress)).length,
    }));

  const active = (Object.entries(filters) as [FacetKey, string | undefined][]).filter(([, v]) => v);
  const labelOf = (key: FacetKey, value: string) =>
    key === 'category'
      ? CATEGORIES.find((c) => c.id === value)?.english
      : key === 'level'
        ? LEVELS.find((l) => l.id === value)?.english
        : key === 'status'
          ? value === 'read' ? 'Read' : 'Unread'
          : key === 'topic' || key === 'form'
            ? TAG_BY_ID.get(value)?.english
            : value;

  const forms = options('form', TAGS.filter((t) => t.group === 'form').map((t) => ({ value: t.id, label: t.english })));
  const authors = options('author', AUTHORS.map((a) => ({ value: a, label: a })));

  return (
    <div className="page page-wide">
      <header className="page-head">
        <p className="urdu page-urdu">کتب خانہ</p>
        <h1>Library</h1>
        <p className="muted">
          {PASSAGES.length} passages · {readCount} read. Tap any word for its meaning and add the ones you want to keep.
        </p>
      </header>

      <div className="library-layout">
        <aside className="facets" aria-label="Filters">
          <Facet
            title="Type"
            value={filters.category}
            onChange={(v) => set('category', v)}
            options={options('category', CATEGORIES.map((c) => ({ value: c.id, label: c.english })))}
          />
          <Facet
            title="Level"
            variant="chips"
            value={filters.level}
            onChange={(v) => set('level', v)}
            options={options('level', LEVELS.map((l) => ({ value: l.id, label: l.english })))}
          />
          <Facet
            title="Status"
            variant="chips"
            value={filters.status}
            onChange={(v) => set('status', v)}
            options={options('status', [
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ])}
          />
          {authors.some((o) => o.count > 0) && (
            <Facet title="Poet / writer" value={filters.author} onChange={(v) => set('author', v)} options={authors} hideEmpty />
          )}
          <Facet
            title="Topic"
            value={filters.topic}
            onChange={(v) => set('topic', v)}
            options={options('topic', TAGS.filter((t) => t.group === 'topic').map((t) => ({ value: t.id, label: t.english })))}
            hideEmpty
            limit={8}
          />
          {forms.some((o) => o.count > 0) && (
            <Facet title="Poem form" variant="chips" value={filters.form} onChange={(v) => set('form', v)} options={forms} hideEmpty />
          )}
        </aside>

        <section>
          <div className="results-bar">
            <span className="muted small">
              {list.length} passage{list.length === 1 ? '' : 's'}
              {items.length !== list.length && ` on ${items.length} card${items.length === 1 ? '' : 's'}`}
            </span>
            {active.map(([key, value]) => (
              <button key={key} className="active-chip" onClick={() => set(key, undefined)} title="Remove this filter">
                {labelOf(key, value!)} <span aria-hidden>×</span>
              </button>
            ))}
            {active.length > 1 && (
              <button className="link-btn" onClick={() => setFilters({})}>
                Clear all
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="muted empty">No passages match these filters.</p>
          ) : (
            <div className="passage-list">
              {items.map((it) =>
                it.kind === 'passage' ? (
                  <PassageCard key={it.passage.id} passage={it.passage} progress={progress} />
                ) : (
                  <SeriesCard key={it.id} seriesId={it.id} matching={it.matching} progress={progress} />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Facet({
  title,
  value,
  options,
  onChange,
  variant = 'list',
  hideEmpty = false,
  limit,
}: {
  title: string;
  value?: string;
  options: Option[];
  onChange: (v?: string) => void;
  variant?: 'list' | 'chips';
  hideEmpty?: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = options.filter((o) => !hideEmpty || o.count > 0 || o.value === value);
  const shown =
    limit && !expanded && visible.length > limit + 2
      ? visible.filter((o, i) => i < limit || o.value === value)
      : visible;

  return (
    <div className="facet">
      <h3 className="facet-title">{title}</h3>
      <div className={variant === 'chips' ? 'facet-chips' : 'facet-list'}>
        {shown.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              className={variant === 'chips' ? `filter-chip ${on ? 'active' : ''}` : `facet-opt ${on ? 'active' : ''}`}
              aria-pressed={on}
              disabled={!on && o.count === 0}
              onClick={() => onChange(on ? undefined : o.value)}
            >
              <span>{o.label}</span>
              <span className="facet-count">{o.count}</span>
            </button>
          );
        })}
      </div>
      {shown.length < visible.length && (
        <button className="link-btn facet-more" onClick={() => setExpanded(true)}>
          + {visible.length - shown.length} more
        </button>
      )}
    </div>
  );
}

function PassageCard({ passage: p, progress }: { passage: Passage; progress: Progress }) {
  const pr = progress[p.id];
  const by = byline(p);
  return (
    <a className={`passage-card ${pr?.read ? 'is-read' : ''}`} href={`#/read/${p.id}`}>
      <p className="urdu passage-card-title">{p.title.urdu}</p>
      <p className="passage-card-en">{p.title.english}</p>
      {by && <p className="passage-card-by">{by}</p>}
      <div className="passage-card-meta">
        <span className={`level level-${p.level}`}>{p.level}</span>
        <span className="chip">{CATEGORIES.find((c) => c.id === p.category)?.english}</span>
        {pr?.read && (
          <span className="chip chip-done">
            ✓ Read{pr.score !== undefined ? ` · ${pr.score}/${p.questions.length}` : ''}
          </span>
        )}
      </div>
    </a>
  );
}

function SeriesCard({ seriesId, matching, progress }: { seriesId: string; matching: Passage[]; progress: Progress }) {
  const [open, setOpen] = useState(false);
  const parts = seriesParts(seriesId);
  const first = parts[0];
  const read = parts.filter((p) => isRead(p, progress)).length;
  const next = parts.find((p) => !isRead(p, progress));
  const levels = LEVELS.filter((l) => parts.some((p) => p.level === l.id));
  const matchIds = new Set(matching.map((p) => p.id));
  const by = byline(first);

  return (
    <div className={`passage-card series-card ${read === parts.length ? 'is-read' : ''}`}>
      <a className="series-head" href={`#/read/${(next ?? first).id}`}>
        <p className="urdu passage-card-title">{seriesUrduTitle(seriesId)}</p>
        <p className="passage-card-en">{first.series!.title}</p>
        {by && <p className="passage-card-by">{by}</p>}
      </a>
      <div className="passage-card-meta">
        {levels.map((l) => (
          <span key={l.id} className={`level level-${l.id}`}>{l.id}</span>
        ))}
        <span className="chip">{CATEGORIES.find((c) => c.id === first.category)?.english}</span>
        <span className="chip chip-series">{parts.length} parts</span>
      </div>
      <div className="series-progress" title={`${read} of ${parts.length} parts read`}>
        <span className="bar">
          <span style={{ width: `${(read / parts.length) * 100}%` }} />
        </span>
        <span className="small muted">
          {read}/{parts.length} read
        </span>
      </div>
      <div className="series-actions">
        <a className="btn btn-soft btn-sm" href={`#/read/${(next ?? first).id}`}>
          {read === 0 ? 'Start · Part 1' : next ? `Continue · Part ${next.series!.part}` : 'Read again'}
        </a>
        <button className="link-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Hide parts ▴' : `All ${parts.length} parts ▾`}
        </button>
      </div>
      {matching.length < parts.length && !open && (
        <p className="muted small series-match">
          {matching.length} of {parts.length} parts match your filters
        </p>
      )}
      {open && (
        <ol className="series-parts">
          {parts.map((p) => {
            const pr = progress[p.id];
            return (
              <li key={p.id} className={matchIds.has(p.id) ? '' : 'dim'}>
                <a className={pr?.read ? 'is-read' : ''} href={`#/read/${p.id}`} title={p.intro}>
                  <span>Part {p.series!.part}</span>
                  {pr?.read && <span>{pr.score !== undefined ? `✓ ${pr.score}/${p.questions.length}` : '✓'}</span>}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
