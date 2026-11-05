import { describe, expect, it } from 'vitest';
import { buildDowntimeReport, buildDowntimeText, buildUptimeReport, buildUptimeText, evaluateDowntime, evaluateUptime, formatSpan, formatUptime } from './logic.js';

const rows = (text) => Object.fromEntries(evaluateUptime(text).result.rows.map(({ id, value }) => [id, value]));

describe('formatSpan', () => {
  it.each([
    [0, '0 s'],
    [0.0864, '86.4 ms'],
    [1, '1 s'],
    [86.4, '1 min 26.4 s'],
    [3600, '1 h'],
    [90061, '1 d 1 h 1 min 1 s'],
    [59.96, '1 min'],
  ])('formats %f', (seconds, text) => {
    expect(formatSpan(seconds)).toBe(text);
  });
});

describe('evaluateUptime', () => {
  it('works out three nines', () => {
    expect(rows('99.9')).toEqual({ day: '1 min 26.4 s', week: '10 min 4.8 s', month: '43 min 49.8 s', quarter: '2 h 11 min 29.4 s', year: '8 h 45 min 57.6 s' });
  });

  it('works out four and five nines', () => {
    expect(rows('99.99').year).toBe('52 min 35.8 s');
    expect(rows('99.999').year).toBe('5 min 15.6 s');
  });

  it('handles the limits', () => {
    expect(rows('100').year).toBe('0 s');
    expect(rows('0').day).toBe('1 d');
  });

  it.each(['-1', '101', 'abc'])('rejects %j', (text) => {
    expect(evaluateUptime(text).error).toBeTruthy();
  });

  it('has nothing for blank input', () => {
    expect(evaluateUptime(' ')).toEqual({ result: null });
  });
});

describe('evaluateDowntime', () => {
  it('works out the uptime', () => {
    expect(formatUptime(evaluateDowntime('30', 'month').result.uptime)).toBe('99.931554%');
    expect(evaluateDowntime('1440', 'day').result.uptime).toBe(0);
    expect(evaluateDowntime('0', 'day').result.uptime).toBe(100);
  });

  it.each([
    ['-5', 'day', "can't be negative"],
    ['1441', 'day', 'more downtime than one day has'],
    ['abc', 'day', 'valid number'],
  ])('rejects %j per %s', (minutes, period, message) => {
    expect(evaluateDowntime(minutes, period).error).toContain(message);
  });
});

describe('output', () => {
  it('builds the downtime text and report', () => {
    const { result } = evaluateUptime('99.9');
    expect(buildDowntimeText(result)).toContain('Downtime per year: 8 h 45 min 57.6 s');
    const report = buildDowntimeReport(result);
    expect(report.inputs[0].value).toBe('99.9%');
    expect(report.results).toHaveLength(5);
    expect(report.notes[0]).toContain('365.25');
  });

  it('builds the uptime text and report', () => {
    const { result } = evaluateDowntime('60', 'day');
    expect(buildUptimeText(result)).toContain('Downtime of 1 h in a day');
    expect(buildUptimeReport(result).results[0].value).toBe('95.833333%');
  });
});
