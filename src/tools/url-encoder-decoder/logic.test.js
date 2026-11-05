import { describe, expect, it } from 'vitest';
import { buildReport, evaluate } from './logic.js';

const base = { modeId: 'encode', scopeId: 'component', plusAsSpace: false };

describe('URL tool', () => {
  it('encodes a single value', () => {
    expect(evaluate({ ...base, text: 'cats & dogs' }).output).toBe('cats%20%26%20dogs');
    expect(evaluate({ ...base, text: 'नमस्ते' }).output).toBe('%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87');
  });

  it('encodes a whole URL, keeping its structure', () => {
    expect(evaluate({ ...base, scopeId: 'url', text: 'https://a.com/my page?q=1' }).output).toBe('https://a.com/my%20page?q=1');
  });

  it('decodes', () => {
    expect(evaluate({ ...base, modeId: 'decode', text: 'cats%20%26%20dogs' }).output).toBe('cats & dogs');
    expect(evaluate({ ...base, modeId: 'decode', scopeId: 'url', text: 'a%20b%26c' }).output).toBe('a b%26c');
  });

  it('can treat plus signs as spaces', () => {
    expect(evaluate({ ...base, modeId: 'decode', text: 'a+b' }).output).toBe('a+b');
    expect(evaluate({ ...base, modeId: 'decode', text: 'a+b', plusAsSpace: true }).output).toBe('a b');
  });

  it.each(['%', '%E0%A4', '%zz'])('explains broken input %j', (text) => {
    expect(evaluate({ ...base, modeId: 'decode', text }).error).toContain('broken percent code');
  });

  it('explains text that cannot be encoded', () => {
    expect(evaluate({ ...base, text: '\ud800' }).error).toContain('could not be encoded');
  });

  it('has nothing for empty text', () => {
    expect(evaluate({ ...base, text: '' })).toEqual({ error: null, output: null });
  });

  it('builds the report', () => {
    expect(buildReport(base, 'a').inputs).toHaveLength(2);
    expect(buildReport({ ...base, modeId: 'decode' }, 'a').inputs).toHaveLength(3);
  });
});
