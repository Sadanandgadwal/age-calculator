import { describe, expect, it } from 'vitest';
import { buildReport, readLines, sortLines } from './logic.js';

describe('sortLines', () => {
  it.each([
    ['az', ['Zara', 'adam', 'Mina'], ['adam', 'Mina', 'Zara']],
    ['za', ['adam', 'Zara', 'Mina'], ['Zara', 'Mina', 'adam']],
    ['az', ['Item 10', 'Item 2', 'Item 1'], ['Item 1', 'Item 2', 'Item 10']],
    ['az', ['Éva', 'Dan', 'Finn'], ['Dan', 'Éva', 'Finn']],
    ['number', ['100', '20', '3.5', '-1'], ['-1', '3.5', '20', '100']],
    ['number', ['1,000 mice', '20 cats', 'none'], ['20 cats', '1,000 mice', 'none']],
    ['length', ['ccc', 'a', 'bb', 'aa'], ['a', 'aa', 'bb', 'ccc']],
  ])('%s sorts %j', (mode, lines, expected) => {
    expect(sortLines(lines, mode)).toEqual(expected);
  });

  it('leaves the source alone', () => {
    const lines = ['b', 'a'];
    sortLines(lines, 'az');
    expect(lines).toEqual(['b', 'a']);
  });
});

describe('readLines', () => {
  it('can remove blank lines', () => {
    expect(readLines('a\n\n \nb', true)).toEqual(['a', 'b']);
    expect(readLines('a\n\nb', false)).toEqual(['a', '', 'b']);
  });
});

describe('buildReport', () => {
  it('lists the order and lines', () => {
    const report = buildReport('A to Z', ['a', 'b']);
    expect(report.inputs[0].value).toBe('A to Z');
    expect(report.text.value).toBe('a\nb');
  });
});
