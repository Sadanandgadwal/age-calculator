import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, duplicateNote, evaluate } from './logic.js';

describe('JSON Validator', () => {
  it('has no result for blank text', () => {
    expect(evaluate(' ')).toBeNull();
  });

  it('describes valid JSON', () => {
    const result = evaluate('{"a":[1,2],"b":{}}');
    expect(result.valid).toBe(true);
    expect(result.stats).toMatchObject({ objects: 2, arrays: 1, keys: 2, numbers: 2, depth: 3 });
    expect(buildResultText(result)).toContain('Valid JSON');
    expect(buildReport(result).results[1]).toEqual({ label: 'Objects', value: '2' });
  });

  it('explains invalid JSON', () => {
    const result = evaluate('{\n"a":1,\n}');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Line 3');
    expect(buildResultText(result)).toContain('Invalid JSON');
    expect(buildReport(result).results[0].value).toBe('Invalid JSON');
    expect(buildReport(result).notes[0]).toContain('Line 3');
  });

  it('flags repeated keys', () => {
    expect(duplicateNote(evaluate('{"a":1,"a":2}'))).toContain('1 key is repeated');
    expect(duplicateNote(evaluate('{"a":1,"a":2,"b":1,"b":2}'))).toContain('2 keys are repeated');
    expect(duplicateNote(evaluate('{"a":1}'))).toBeNull();
    expect(buildReport(evaluate('{"a":1,"a":2}')).notes[0]).toContain('repeated');
  });
});
