import { describe, expect, it } from 'vitest';
import { countCharacters, durationSeconds, excerpt, formatTextDuration, getLines, getTextStats, getWords, splitGraphemes } from './textStats.js';

describe('getWords', () => {
  it.each([
    ['', 0],
    ['   \n ', 0],
    ['one', 1],
    ['one two  three\nfour', 4],
    ["don't well-known", 2],
    ['a — b & c', 3],
    ['नमस्ते दुनिया', 2],
    ['3.14 is pi', 3],
  ])('counts %j as %i', (text, count) => {
    expect(getWords(text)).toHaveLength(count);
  });
});

describe('countCharacters', () => {
  it('counts each visible character once', () => {
    expect(countCharacters('abc')).toBe(3);
    expect(countCharacters('a😀b')).toBe(3);
    expect(countCharacters('👨‍👩‍👧')).toBe(1);
    expect(countCharacters('é')).toBe(1);
    expect(countCharacters('')).toBe(0);
  });
});

describe('getLines', () => {
  it('has no lines for empty text, and keeps blank ones', () => {
    expect(getLines('')).toEqual([]);
    expect(getLines('a\n\nb')).toEqual(['a', '', 'b']);
    expect(getLines('a\n')).toEqual(['a', '']);
  });
});

describe('getTextStats', () => {
  const stats = getTextStats('Hello there. How are you?\n\nThe value is 3.14 today!\n');

  it('counts words, characters and structure', () => {
    expect(stats).toMatchObject({ words: 10, sentences: 3, paragraphs: 2, lines: 4, nonEmptyLines: 2, blankLines: 2 });
    expect(stats.characters).toBe(52);
    expect(stats.charactersNoSpaces).toBe(41);
  });

  it('counts a last sentence with no full stop', () => {
    expect(getTextStats('One. Two').sentences).toBe(2);
  });

  it('ignores punctuation with no words', () => {
    expect(getTextStats('... !!! ').sentences).toBe(0);
  });

  it('is all zero for empty text', () => {
    expect(getTextStats('')).toMatchObject({ characters: 0, words: 0, sentences: 0, paragraphs: 0, lines: 0 });
  });
});

describe('durations', () => {
  it('rounds up to the next second', () => {
    expect(durationSeconds(238, 238)).toBe(60);
    expect(durationSeconds(1, 238)).toBe(1);
    expect(durationSeconds(0, 238)).toBe(0);
  });

  it.each([
    [0, '0 sec'],
    [45, '45 sec'],
    [60, '1 min'],
    [200, '3 min 20 sec'],
    [3600, '1 h'],
    [3665, '1 h 1 min 5 sec'],
  ])('formats %i seconds as %s', (seconds, text) => {
    expect(formatTextDuration(seconds)).toBe(text);
  });
});

describe('helpers', () => {
  it('keeps emoji whole when splitting', () => {
    expect(splitGraphemes('a😀')).toEqual(['a', '😀']);
  });

  it('shortens only long text', () => {
    expect(excerpt('short')).toBe('short');
    expect(excerpt('x'.repeat(1500))).toBe(`${'x'.repeat(1000)}…`);
  });
});
