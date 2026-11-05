import { describe, expect, it } from 'vitest';
import { MAX_MATCHES, buildReport, buildResultText, buildSegments, describeGroups, runRegex } from './logic.js';

describe('runRegex', () => {
  it('finds every match with the g flag, or the first without', () => {
    expect(runRegex({ pattern: '\\d+', flags: 'g', text: 'a1 b22' }).matches.map(({ text }) => text)).toEqual(['1', '22']);
    expect(runRegex({ pattern: '\\d+', flags: '', text: 'a1 b22' }).matches.map(({ text }) => text)).toEqual(['1']);
  });

  it('reports positions and groups', () => {
    const { matches } = runRegex({ pattern: '(\\d{4})-(\\d{2})?', flags: 'g', text: 'x 2026-' });
    expect(matches[0]).toEqual({ index: 2, text: '2026-', groups: ['2026', null], named: null });
  });

  it('reports named groups', () => {
    expect(runRegex({ pattern: '(?<user>\\w+)@', flags: '', text: 'asha@x' }).matches[0].named).toEqual({ user: 'asha' });
  });

  it('follows the flags', () => {
    expect(runRegex({ pattern: 'A', flags: 'gi', text: 'aA' }).matches).toHaveLength(2);
    expect(runRegex({ pattern: '^b', flags: 'gm', text: 'a\nb' }).matches).toHaveLength(1);
    expect(runRegex({ pattern: 'a.b', flags: 's', text: 'a\nb' }).matches).toHaveLength(1);
    expect(runRegex({ pattern: '^.$', flags: 'u', text: '😀' }).matches).toHaveLength(1);
  });

  it('handles empty matches without hanging', () => {
    expect(runRegex({ pattern: 'x*', flags: 'g', text: 'ab' }).matches).toHaveLength(3);
  });

  it('stops at the limit', () => {
    const result = runRegex({ pattern: 'a', flags: 'g', text: 'a'.repeat(MAX_MATCHES + 5) });
    expect(result.matches).toHaveLength(MAX_MATCHES);
    expect(result.truncated).toBe(true);
  });

  it('explains an invalid pattern, without throwing', () => {
    expect(runRegex({ pattern: '(', flags: 'g', text: 'a' }).error).toContain('not a valid pattern');
  });
});

describe('buildSegments', () => {
  it('splits text around matches', () => {
    const { matches } = runRegex({ pattern: '\\d', flags: 'g', text: 'a1b2' });
    expect(buildSegments('a1b2', matches)).toEqual([
      { text: 'a', isMatch: false },
      { text: '1', isMatch: true },
      { text: 'b', isMatch: false },
      { text: '2', isMatch: true },
    ]);
  });

  it('skips empty matches, and keeps all the text', () => {
    const { matches } = runRegex({ pattern: 'x*', flags: 'g', text: 'ab' });
    expect(buildSegments('ab', matches)).toEqual([{ text: 'ab', isMatch: false }]);
  });
});

describe('output', () => {
  const request = { pattern: '(a)', flags: 'g', text: 'a a' };
  const result = runRegex(request);

  it('describes groups', () => {
    expect(describeGroups(result.matches[0])).toBe('1: a');
    expect(describeGroups({ groups: ['x'], named: { y: 'x' } })).toBe('y: x');
    expect(describeGroups({ groups: [null], named: null })).toBe('1: (none)');
  });

  it('builds the copied text and report', () => {
    expect(buildResultText(result)).toContain('Matches: 2');
    const report = buildReport(request, result);
    expect(report.inputs[1].value).toBe('g');
    expect(report.table.rows[1]).toEqual([2, 2, 'a', '1: a']);
  });

  it('has no table without matches', () => {
    expect(buildReport(request, { matches: [], truncated: false }).table).toBeNull();
  });
});
