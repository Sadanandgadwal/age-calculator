import { describe, expect, it } from 'vitest';
import { buildReport, evaluate, slugify } from './logic.js';

describe('slugify', () => {
  it.each([
    ['10 Tips for Better Sleep!', '10-tips-for-better-sleep'],
    ['Café & Bistro', 'cafe-and-bistro'],
    ['Don’t Panic', 'dont-panic'],
    ["it's", 'its'],
    ['  spaced   out  ', 'spaced-out'],
    ['---a---b---', 'a-b'],
    ['Straße Øre', 'strasse-ore'],
    ['नमस्ते दुनिया', 'नमस्ते-दुनिया'],
    ['!!!', ''],
  ])('turns %j into %j', (text, expected) => {
    expect(slugify(text)).toBe(expected);
  });

  it('follows the separator and case options', () => {
    expect(slugify('Hello Big World', '_')).toBe('hello_big_world');
    expect(slugify('Hello World', '-', true)).toBe('Hello-World');
  });
});

describe('evaluate and report', () => {
  it('has no result for blank text', () => {
    expect(evaluate('  ', '-', false)).toBeNull();
    expect(evaluate('!!!', '-', false)).toEqual({ slug: '' });
  });

  it('builds the report', () => {
    const report = buildReport(' Hi There ', '_', false, 'hi_there');
    expect(report.inputs[0].value).toBe('Hi There');
    expect(report.inputs[1].value).toBe('Underscore (_)');
    expect(report.text.value).toBe('hi_there');
  });
});
