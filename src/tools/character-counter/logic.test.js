import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, countKinds, describeLimit, evaluate } from './logic.js';

describe('countKinds', () => {
  it('sorts characters into kinds', () => {
    expect(countKinds('Ab 1!😀\n')).toEqual({ letters: 2, digits: 1, spaces: 2, symbols: 2 });
    expect(countKinds('नमस्ते')).toMatchObject({ digits: 0, spaces: 0 });
  });
});

describe('evaluate', () => {
  it('counts with and without spaces', () => {
    expect(evaluate('Hello world', '').result).toMatchObject({ characters: 11, charactersNoSpaces: 10, words: 2, limit: null });
    expect(evaluate('Hi 😀', '').result.characters).toBe(4);
  });

  it('has no result for empty text, but counts spaces alone', () => {
    expect(evaluate('', '').result).toBeNull();
    expect(evaluate('  ', '').result.characters).toBe(2);
  });

  it.each([
    ['0', 'Please enter a limit of 1 or more.'],
    ['2.5', 'Please enter a whole number.'],
    ['abc', 'Please enter a valid number, without commas or symbols.'],
  ])('rejects a limit of %s', (limit, message) => {
    expect(evaluate('text', limit).errors.limit).toBe(message);
  });

  it('describes the limit', () => {
    expect(describeLimit(evaluate('12345', '160').result)).toBe('155 left of 160');
    expect(describeLimit(evaluate('12345', '3').result)).toBe('2 over the limit of 3');
    expect(describeLimit(evaluate('12345', '').result)).toBeNull();
  });
});

describe('output', () => {
  it('includes the limit only when set', () => {
    const withLimit = evaluate('Hello', '10').result;
    expect(buildResultText(withLimit)).toContain('5 left of 10');
    expect(buildReport('Hello', withLimit).inputs[0].value).toBe('10');
    expect(buildReport('Hello', evaluate('Hello', '').result).inputs).toBeNull();
  });
});
