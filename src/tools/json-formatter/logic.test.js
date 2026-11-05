import { describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

describe('JSON Formatter', () => {
  it('formats with the chosen indent', () => {
    expect(evaluate('{"a":1}', 'two', false).output).toBe('{\n  "a": 1\n}');
    expect(evaluate('{"a":1}', 'four', false).output).toBe('{\n    "a": 1\n}');
    expect(evaluate('{"a":1}', 'tab', false).output).toBe('{\n\t"a": 1\n}');
  });

  it('can sort keys', () => {
    expect(evaluate('{"b":1,"a":2}', 'two', true).output).toBe('{\n  "a": 2,\n  "b": 1\n}');
  });

  it('has nothing for blank text, and explains bad JSON', () => {
    expect(evaluate('  ', 'two', false)).toEqual({ error: null, output: null });
    expect(evaluate('{a}', 'two', false).error).toContain('not valid JSON');
  });

  it('builds a monospace report', () => {
    const report = buildReport('{\n}', 'tab', true);
    expect(report.inputs).toEqual([{ label: 'Indent', value: 'Tab' }, { label: 'Sort keys', value: 'Yes' }]);
    expect(report.text.mono).toBe(true);
    expect(report.results[0].value).toBe('2');
  });
});
