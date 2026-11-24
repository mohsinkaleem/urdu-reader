import commonGlossary from '../../content/glossary.json';

/** Gloss: [roman, english] */
export type Gloss = [roman: string, english: string];

export type Category = 'starter' | 'wikipedia' | 'news' | 'stories' | 'poetry';
export type Level = 'easy' | 'medium' | 'hard';

export const CATEGORIES: { id: Category; urdu: string; english: string }[] = [
  { id: 'starter', urdu: 'آسان مطالعہ', english: 'Starter reads' },
  { id: 'wikipedia', urdu: 'مضامین', english: 'Articles' },
  { id: 'news', urdu: 'خبریں', english: 'News' },
  { id: 'stories', urdu: 'افسانے', english: 'Stories' },
  { id: 'poetry', urdu: 'شاعری', english: 'Poetry' },
];

export const LEVELS: { id: Level; english: string }[] = [
  { id: 'easy', english: 'Easy' },
  { id: 'medium', english: 'Medium' },
  { id: 'hard', english: 'Hard' },
];

/**
 * Topic tags say what a passage is about; form tags say what kind of poem it is.
 * Every passage has at least one topic. Poems also have one form.
 */
export const TAGS = [
  { id: 'history', group: 'topic', english: 'History', urdu: 'تاریخ' },
  { id: 'people', group: 'topic', english: 'People', urdu: 'شخصیات' },
  { id: 'places', group: 'topic', english: 'Places', urdu: 'مقامات' },
  { id: 'culture', group: 'topic', english: 'Food & culture', urdu: 'ثقافت' },
  { id: 'faith', group: 'topic', english: 'Faith', urdu: 'مذہب' },
  { id: 'politics', group: 'topic', english: 'Politics', urdu: 'سیاست' },
  { id: 'society', group: 'topic', english: 'Society', urdu: 'معاشرہ' },
  { id: 'sports', group: 'topic', english: 'Sports', urdu: 'کھیل' },
  { id: 'science', group: 'topic', english: 'Science & tech', urdu: 'سائنس' },
  { id: 'language', group: 'topic', english: 'Language & literature', urdu: 'زبان و ادب' },
  { id: 'arts', group: 'topic', english: 'Arts & media', urdu: 'فنون' },
  { id: 'love', group: 'topic', english: 'Love', urdu: 'محبت' },
  { id: 'nature', group: 'topic', english: 'Nature & animals', urdu: 'فطرت' },
  { id: 'philosophy', group: 'topic', english: 'Life & philosophy', urdu: 'فکر' },
  { id: 'homeland', group: 'topic', english: 'Homeland', urdu: 'وطن' },
  { id: 'children', group: 'topic', english: "Children's", urdu: 'بچوں کے لیے' },
  { id: 'everyday', group: 'topic', english: 'Everyday life', urdu: 'روزمرہ' },
  { id: 'ghazal', group: 'form', english: 'Ghazal', urdu: 'غزل' },
  { id: 'nazm', group: 'form', english: 'Nazm', urdu: 'نظم' },
] as const satisfies readonly { id: string; group: 'topic' | 'form'; english: string; urdu: string }[];

export type Tag = (typeof TAGS)[number]['id'];
export const TAG_BY_ID = new Map<string, (typeof TAGS)[number]>(TAGS.map((t) => [t.id, t]));

export type Sentence = {
  urdu: string;
  english: string;
  /** A line of poetry: rendered centred. */
  verse?: boolean;
  /** Commentary shown after this line (e.g. tashreeh after a couplet). */
  explanation?: { urdu: string; english: string };
};

export type Question = {
  urdu: string;
  english: string;
  options: { urdu: string; english: string }[];
  answer: number;
};

export type Source = {
  name: string;
  url?: string;
  author?: string;
  license?: string;
};

export type Passage = {
  id: string;
  title: { urdu: string; english: string };
  category: Category;
  level: Level;
  /** Topic tags, plus a form tag for poems. See TAGS. */
  tags?: Tag[];
  source: Source;
  /** Short context note shown above the text. */
  intro?: string;
  series?: { id: string; title: string; part: number; of: number };
  sentences: Sentence[];
  glossary: Record<string, Gloss>;
  questions: Question[];
};

/**
 * Normalise Urdu text so lookups match regardless of source encoding:
 * Arabic yeh/kaf/heh -> Urdu forms, strip zero-width and bidi control characters.
 */
export function normalizeUrdu(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[​-‏‪-‮⁦-⁩﻿]/g, '')
    .replace(/ي/g, 'ی') // ي -> ی
    .replace(/ى/g, 'ی') // ى -> ی
    .replace(/ك/g, 'ک') // ك -> ک
    .replace(/ه/g, 'ہ') // ه -> ہ
    .normalize('NFC');
}

/**
 * Vowel marks (zer, zabar, pesh, shadda, tanween, jazm, khari zabar) and honorific signs such as ؐ.
 * Classical sources print them; lookups ignore them so "سُود" finds the gloss for "سود".
 */
const HARAKAT_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;

export function stripHarakat(s: string): string {
  return s.replace(HARAKAT_RE, '');
}

function normalizeGlossary(g: Record<string, Gloss>): Record<string, Gloss> {
  const out: Record<string, Gloss> = {};
  for (const [k, v] of Object.entries(g)) out[normalizeUrdu(k)] = v;
  // Also index each entry without vowel marks, unless that bare form has its own entry.
  for (const [k, v] of Object.entries(out)) {
    const bare = stripHarakat(k);
    if (!(bare in out)) out[bare] = v;
  }
  return out;
}

function normalizePassage(p: Passage): Passage {
  return {
    ...p,
    sentences: p.sentences.map((s) => ({ ...s, urdu: normalizeUrdu(s.urdu) })),
    glossary: normalizeGlossary(p.glossary),
  };
}

export const COMMON_GLOSSARY: Record<string, Gloss> = normalizeGlossary(commonGlossary as unknown as Record<string, Gloss>);

const modules = import.meta.glob<Passage>('../../content/passages/*.json', { eager: true, import: 'default' });

/** Raw modules keyed by file path; used by the content tests. */
export const PASSAGE_FILES: Record<string, Passage> = modules;

const LEVEL_ORDER: Record<Level, number> = { easy: 0, medium: 1, hard: 2 };
const CAT_ORDER: Record<Category, number> = { starter: 0, wikipedia: 1, news: 2, stories: 3, poetry: 4 };

export const PASSAGES: Passage[] = Object.values(modules)
  .map(normalizePassage)
  .sort(
    (a, b) =>
      CAT_ORDER[a.category] - CAT_ORDER[b.category] ||
      (a.series && b.series && a.series.id === b.series.id
        ? a.series.part - b.series.part
        : LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.id.localeCompare(b.id)),
  );

export const PASSAGE_BY_ID = new Map(PASSAGES.map((p) => [p.id, p]));

/** Categories whose source.author is the writer (poet, story writer) rather than a reporter. */
const LITERARY: Category[] = ['stories', 'poetry'];

export function authorOf(p: Passage): string | undefined {
  return LITERARY.includes(p.category) ? p.source.author : undefined;
}

/** All parts of a series, in order. */
export function seriesParts(seriesId: string): Passage[] {
  return PASSAGES.filter((p) => p.series?.id === seriesId);
}

/** "شکوہ (حصہ 1)" → "شکوہ": the series title in Urdu, from its first part. */
export function seriesUrduTitle(seriesId: string): string {
  const first = seriesParts(seriesId)[0];
  return first ? first.title.urdu.replace(/\s*[(（][^()]*[)）]\s*$/u, '') : '';
}
