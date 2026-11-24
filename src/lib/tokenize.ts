import { COMMON_GLOSSARY, stripHarakat, type Gloss } from '../data/library';
import { VOCAB_BY_URDU, type Word } from '../data/vocab';

export type Token = { word: string; lead: string; trail: string };

const PUNCT = '۔،؟!,.:;؛"\'«»“”‘’…()\\[\\]{}\\-–—٭*/';
const LEAD_RE = new RegExp(`^[${PUNCT}]+`, 'u');
const TRAIL_RE = new RegExp(`[${PUNCT}]+$`, 'u');
const NON_WORD_RE = /^[\p{N}\p{P}\p{S}]*$/u;

/** Punctuation printed with no space after it ("ہے،ناداری") still separates two words. */
const JOINED_RE = /(?<=\p{L}[\p{M}]*[،۔؟؛,!"])(?=\p{L})/u;

export function tokenize(text: string): Token[] {
  return text
    .split(/\s+/u)
    .filter(Boolean)
    .flatMap((raw) => raw.split(JOINED_RE))
    .map((raw) => {
      const lead = raw.match(LEAD_RE)?.[0] ?? '';
      const rest = raw.slice(lead.length);
      const trail = rest.match(TRAIL_RE)?.[0] ?? '';
      return { lead, trail, word: rest.slice(0, rest.length - trail.length) };
    });
}

/** Numbers and bare punctuation don't need a gloss. */
export function needsGloss(word: string): boolean {
  return word.length > 0 && !NON_WORD_RE.test(word);
}

export type RomanToken = { lead: string; roman: string; trail: string; ambiguous: boolean };

const LATIN_PUNCT: Record<string, string> = { '۔': '.', '،': ',', '؟': '?', '؛': ';', '«': '“', '»': '”' };

function toLatin(s: string): string {
  return s
    .replace(/[۔،؟؛«»]/g, (c) => LATIN_PUNCT[c])
    .replace(/[۰-۹٠-٩]/g, (d) => {
      const c = d.charCodeAt(0);
      return String(c >= 0x06f0 ? c - 0x06f0 : c - 0x0660);
    });
}

/**
 * Roman Urdu for a tokenized sentence, built from the glosses.
 * A gloss like "main / mein" means the spelling has two readings and context decides,
 * so it comes back as "main/mein" with `ambiguous` set rather than guessing one.
 */
export function romanize(tokens: Token[], glossary: Record<string, Gloss> = {}): RomanToken[] {
  return tokens.map((t) => {
    const alts = (lookup(t.word, glossary)?.roman ?? toLatin(t.word)).split(/\s*\/\s*/);
    return { lead: toLatin(t.lead), roman: alts.join('/'), trail: toLatin(t.trail), ambiguous: alts.length > 1 };
  });
}

/**
 * Look up a word: passage glossary first, then the vocab bank, then common function words.
 * Vowel marks are ignored, and the returned word is the bare form so the deck has one card per word.
 */
export function lookup(word: string, glossary: Record<string, Gloss> = {}): Word | undefined {
  const bare = stripHarakat(word);
  const g = glossary[word] ?? glossary[bare];
  if (g) return { urdu: bare, roman: g[0], english: g[1], topic: VOCAB_BY_URDU.get(bare)?.topic };
  const v = VOCAB_BY_URDU.get(word) ?? VOCAB_BY_URDU.get(bare);
  if (v) return v;
  const c = COMMON_GLOSSARY[word] ?? COMMON_GLOSSARY[bare];
  if (c) return { urdu: bare, roman: c[0], english: c[1] };
  return undefined;
}
