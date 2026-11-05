import { describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

describe('JSON Minifier', () => {
  it('removes spacing and measures the saving', () => {
    expect(evaluate('{ "a" : 1 }').result).toEqual({ output: '{"a":1}', before: 11, after: 7, saved: 4, percent: 36.4 });
  });

  it('keeps strings and long numbers', () => {
    expect(evaluate('{ "n": "A  B", "v": 12345678901234567890 }').result.output).toBe('{"n":"A  B","v":12345678901234567890}');
  });

  it('measures bytes, not characters', () => {
    expect(evaluate('"😀"').result.before).toBe(6);
  });

  it('has nothing for blank text, and explains bad JSON', () => {
    expect(evaluate('').result).toBeNull();
    expect(evaluate('{a}').error).toContain('not valid JSON');
  });

  it('builds the report', () => {
    const report = buildReport(evaluate('[ 1 ]').result);
    expect(report.results[0].value).toBe('40%');
    expect(report.details[0].value).toBe('2 bytes');
    expect(report.text.value).toBe('[1]');
  });
});
