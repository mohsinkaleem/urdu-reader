import { describe, expect, it } from 'vitest';
import { normalizeUrdu, stripHarakat } from '../data/library';
import { lookup, needsGloss, romanize, tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits off Urdu punctuation', () => {
    expect(tokenize('ٹماٹر، پیاز اور آلو خریدے۔')).toEqual([
      { lead: '', word: 'ٹماٹر', trail: '،' },
      { lead: '', word: 'پیاز', trail: '' },
      { lead: '', word: 'اور', trail: '' },
      { lead: '', word: 'آلو', trail: '' },
      { lead: '', word: 'خریدے', trail: '۔' },
    ]);
  });

  it('handles brackets and quotes on both sides', () => {
    expect(tokenize('(لاہور) ‘کہا’')).toEqual([
      { lead: '(', word: 'لاہور', trail: ')' },
      { lead: '‘', word: 'کہا', trail: '’' },
    ]);
  });

  it('splits words joined by punctuation without a space', () => {
    expect(tokenize('ہے،ناداری').map((t) => t.word)).toEqual(['ہے', 'ناداری']);
    expect(tokenize('احد"کہتے').map((t) => t.word)).toEqual(['احد', 'کہتے']);
    expect(tokenize('"لاہور"').map((t) => t.word)).toEqual(['لاہور']);
  });

  it('does not require glosses for numbers', () => {
    expect(needsGloss('1947')).toBe(false);
    expect(needsGloss('۱۹۴۷ء')).toBe(true);
    expect(needsGloss('۱۹۴۷')).toBe(false);
    expect(needsGloss('لاہور')).toBe(true);
  });
});

describe('romanize', () => {
  const roman = (text: string, glossary = {}) =>
    romanize(tokenize(text), glossary)
      .map((t) => t.lead + t.roman + t.trail)
      .join(' ');

  it('builds a Roman line from glosses with Latin punctuation', () => {
    expect(roman('بازار، موسم؟', {})).toBe('baazaar, mausam?');
    expect(roman('‘لاہور’۔', { لاہور: ['laahaur', 'Lahore'] })).toBe('‘laahaur’.');
  });

  it('keeps both readings of an ambiguous spelling and flags it', () => {
    const [t] = romanize(tokenize('میں'));
    expect(t.roman).toBe('main/mein');
    expect(t.ambiguous).toBe(true);
    expect(romanize(tokenize('بازار'))[0].ambiguous).toBe(false);
  });

  it('turns Urdu digits into Latin digits', () => {
    expect(roman('۱۹۴۷')).toBe('1947');
    expect(roman('1947')).toBe('1947');
  });
});

describe('normalizeUrdu', () => {
  it('maps Arabic letter forms to Urdu and strips zero-width characters', () => {
    expect(normalizeUrdu('كي‌ه')).toBe('کیہ');
  });
});

describe('vowel marks', () => {
  it('strips harakat and honorific signs', () => {
    expect(stripHarakat('سُود')).toBe('سود');
    expect(stripHarakat('فکرِ')).toBe('فکر');
    expect(stripHarakat('محبوبؐ')).toBe('محبوب');
    expect(stripHarakat('الٰہی')).toBe('الہی');
  });

  it('lookup ignores vowel marks on either side', () => {
    expect(lookup('بازار')?.english).toBe('market');
    expect(lookup('بَازار')?.urdu).toBe('بازار');
    expect(lookup('سُود', { سود: ['sood', 'profit'] })?.english).toBe('profit');
  });
});
