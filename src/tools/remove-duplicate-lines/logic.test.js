import { describe, expect, it } from 'vitest';
import { buildReport, evaluate, removeDuplicates } from './logic.js';

describe('removeDuplicates', () => {
  it('keeps the first of each line, in order', () => {
    expect(removeDuplicates('b\na\nb\nc\na')).toEqual({ output: 'b\na\nc', total: 5, kept: 3, removed: 2 });
  });

  it('is exact by default', () => {
    expect(removeDuplicates('Apple\napple\n apple').kept).toBe(3);
  });

  it('can ignore capital letters, and keeps the first spelling', () => {
    expect(removeDuplicates('Apple\nAPPLE', { ignoreCase: true }).output).toBe('Apple');
  });

  it('can ignore extra spaces', () => {
    expect(removeDuplicates('New York\n  New   York ', { ignoreSpaces: true }).output).toBe('New York');
  });

  it('treats blank lines as repeats, or removes them all', () => {
    expect(removeDuplicates('a\n\nb\n\nc').output).toBe('a\n\nb\nc');
    expect(removeDuplicates('a\n\nb\n\nc', { removeBlank: true }).output).toBe('a\nb\nc');
  });
});

describe('evaluate and report', () => {
  it('has no result for blank text', () => {
    expect(evaluate('  \n', {})).toBeNull();
  });

  it('lists the options and counts', () => {
    const report = buildReport(evaluate('a\na', {}), { ignoreCase: true, ignoreSpaces: false, removeBlank: false });
    expect(report.inputs[0].value).toBe('Yes');
    expect(report.results[1]).toEqual({ label: 'Lines removed', value: '1' });
  });
});
