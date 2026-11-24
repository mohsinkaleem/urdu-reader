import { describe, expect, it } from 'vitest';
import { CATEGORIES, LEVELS, PASSAGES, PASSAGE_FILES, TAG_BY_ID } from './library';
import { lookup, needsGloss, tokenize } from '../lib/tokenize';

const categories = new Set(CATEGORIES.map((c) => c.id));
const levels = new Set(LEVELS.map((l) => l.id));
const nonEmpty = (s: unknown) => typeof s === 'string' && s.trim().length > 0;

describe('content files', () => {
  it('file names match passage ids', () => {
    for (const [path, p] of Object.entries(PASSAGE_FILES)) {
      expect(path.endsWith(`/${p.id}.json`), `${path} has id "${p.id}"`).toBe(true);
    }
  });

  it('passage ids are unique', () => {
    const ids = PASSAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every series has all of its parts', () => {
    const series = new Map<string, number[]>();
    for (const p of PASSAGES) {
      if (!p.series) continue;
      series.set(p.series.id, [...(series.get(p.series.id) ?? []), p.series.part]);
    }
    for (const [id, parts] of series) {
      const of = PASSAGES.find((p) => p.series?.id === id)!.series!.of;
      expect(parts.sort((a, b) => a - b), `series ${id}`).toEqual(Array.from({ length: of }, (_, i) => i + 1));
    }
  });
});

describe.each(PASSAGES.map((p) => [p.id, p] as const))('passage %s', (id, p) => {
  it(`${id}: has valid metadata`, () => {
    expect(nonEmpty(p.title?.urdu) && nonEmpty(p.title?.english), 'title').toBe(true);
    expect(categories.has(p.category), `category "${p.category}"`).toBe(true);
    expect(levels.has(p.level), `level "${p.level}"`).toBe(true);
    expect(nonEmpty(p.source?.name), 'source.name').toBe(true);
    if (p.category !== 'starter') {
      expect(nonEmpty(p.source.url), 'source.url is required for sourced texts').toBe(true);
      expect(nonEmpty(p.source.license), 'source.license is required for sourced texts').toBe(true);
    }
    if (p.series) {
      expect(p.series.part >= 1 && p.series.part <= p.series.of, 'series part in range').toBe(true);
      expect(nonEmpty(p.series.title), 'series.title').toBe(true);
    }
  });

  it(`${id}: has valid tags`, () => {
    const tags = p.tags ?? [];
    expect(tags.length, 'tags are required (see "Tags" in content/README.md)').toBeGreaterThan(0);
    for (const t of tags) expect(TAG_BY_ID.has(t), `unknown tag "${t}" (see TAGS in library.ts)`).toBe(true);
    expect(new Set(tags).size, 'duplicate tags').toBe(tags.length);
    const topics = tags.filter((t) => TAG_BY_ID.get(t)?.group === 'topic');
    const forms = tags.filter((t) => TAG_BY_ID.get(t)?.group === 'form');
    expect(topics.length, 'at least one topic tag').toBeGreaterThanOrEqual(1);
    if (p.category === 'poetry') expect(forms.length, 'poems need exactly one form tag (ghazal or nazm)').toBe(1);
    else expect(forms, 'form tags are for poems only').toEqual([]);
  });

  it(`${id}: every sentence has Urdu and English`, () => {
    expect(p.sentences.length).toBeGreaterThan(0);
    p.sentences.forEach((s, i) => {
      expect(nonEmpty(s.urdu) && nonEmpty(s.english), `sentence ${i}`).toBe(true);
      if (s.explanation) {
        expect(nonEmpty(s.explanation.urdu) && nonEmpty(s.explanation.english), `explanation ${i}`).toBe(true);
      }
    });
  });

  it(`${id}: every word has a gloss`, () => {
    for (const [k, v] of Object.entries(p.glossary)) {
      expect(Array.isArray(v) && v.length === 2 && nonEmpty(v[0]) && nonEmpty(v[1]), `glossary entry "${k}"`).toBe(true);
    }
    const missing = [
      ...new Set(
        p.sentences
          .flatMap((s) => tokenize(s.urdu))
          .map((t) => t.word)
          .filter((w) => needsGloss(w) && !lookup(w, p.glossary)),
      ),
    ];
    expect(missing).toEqual([]);
  });

  it(`${id}: questions are well-formed`, () => {
    expect(p.questions.length).toBeGreaterThanOrEqual(2);
    p.questions.forEach((q, i) => {
      expect(nonEmpty(q.urdu) && nonEmpty(q.english), `question ${i} text`).toBe(true);
      expect(q.options.length, `question ${i} options`).toBeGreaterThanOrEqual(2);
      q.options.forEach((o) => expect(nonEmpty(o.urdu) && nonEmpty(o.english), `question ${i} option`).toBe(true));
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `question ${i} answer`).toBe(true);
    });
  });
});
