import { describe, expect, it } from 'vitest';
import { buildReport, cleanSpaces, evaluate } from './logic.js';

describe('cleanSpaces', () => {
  it.each([
    ['Hello   big  world', 'Hello big world'],
    ['a\t\tb', 'a b'],
    ['a  b', 'a b'],
    ['   Dear Sir  ', 'Dear Sir'],
    ['a\n\n\n\nb', 'a\n\nb'],
    ['\n\na\n\n', 'a'],
    ['  \n \n', ''],
  ])('cleans %j', (text, expected) => {
    expect(cleanSpaces(text)).toBe(expected);
  });

  it('can keep the spacing at line ends, as one space', () => {
    expect(cleanSpaces('   a  \nb', { trimLines: false })).toBe(' a \nb');
  });

  it('can remove all blank lines', () => {
    expect(cleanSpaces('a\n\nb\n  \nc', { removeBlank: true })).toBe('a\nb\nc');
  });
});

describe('evaluate and report', () => {
  it('counts what was removed', () => {
    expect(evaluate('a  b', {})).toEqual({ output: 'a b', removed: 1, characters: 3 });
    expect(evaluate('', {})).toBeNull();
  });

  it('builds the report', () => {
    const report = buildReport(evaluate('a  b', {}), { trimLines: true, removeBlank: false });
    expect(report.inputs[1].value).toBe('No');
    expect(report.text.value).toBe('a b');
  });
});
