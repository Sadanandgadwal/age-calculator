import { describe, expect, it } from 'vitest';
import { buildResultText, currentDateTime, currentTimestamp, describeInstant, fromTimestamp, toTimestamp } from './logic.js';

describe('fromTimestamp', () => {
  it('converts seconds', () => {
    expect(fromTimestamp('1700000000', 'seconds').result).toMatchObject({
      seconds: 1700000000,
      ms: 1700000000000,
      utc: 'Tue, 14 Nov 2023 22:13:20 GMT',
      iso: '2023-11-14T22:13:20.000Z',
    });
  });

  it('converts milliseconds', () => {
    expect(fromTimestamp('1700000000123', 'milliseconds').result).toMatchObject({
      seconds: 1700000000,
      ms: 1700000000123,
      iso: '2023-11-14T22:13:20.123Z',
    });
  });

  it('handles zero and negative timestamps', () => {
    expect(fromTimestamp('0', 'seconds').result.utc).toBe('Thu, 01 Jan 1970 00:00:00 GMT');
    expect(fromTimestamp('-1', 'seconds').result.utc).toBe('Wed, 31 Dec 1969 23:59:59 GMT');
    expect(fromTimestamp('-1500', 'milliseconds').result).toMatchObject({ seconds: -2, iso: '1969-12-31T23:59:58.500Z' });
  });

  it('handles the year 2038 boundary', () => {
    expect(fromTimestamp('2147483648', 'seconds').result.utc).toBe('Tue, 19 Jan 2038 03:14:08 GMT');
  });

  it('accepts the limits of the date range', () => {
    expect(fromTimestamp('8640000000000000', 'milliseconds').result.iso).toBe('+275760-09-13T00:00:00.000Z');
    expect(fromTimestamp('8640000000000', 'seconds').result).toBeTruthy();
  });

  it.each([
    ['', 'Please enter a timestamp.'],
    ['   ', 'Please enter a timestamp.'],
    ['abc', 'Please enter a whole number, with no decimals, commas or symbols.'],
    ['1.5', 'Please enter a whole number, with no decimals, commas or symbols.'],
    ['1,000', 'Please enter a whole number, with no decimals, commas or symbols.'],
    ['1e9', 'Please enter a whole number, with no decimals, commas or symbols.'],
    ['8640000000001', 'This timestamp is outside the supported date range.'],
    ['99999999999999999999', 'This timestamp is outside the supported date range.'],
  ])('rejects %j in seconds', (text, message) => {
    expect(fromTimestamp(text, 'seconds').errors.timestamp).toBe(message);
  });

  it('warns when the number looks like the other unit', () => {
    expect(fromTimestamp('1700000000000', 'seconds').result.hint).toMatch(/looks like milliseconds/);
    expect(fromTimestamp('1700000000', 'milliseconds').result.hint).toMatch(/looks like seconds/);
    expect(fromTimestamp('1700000000', 'seconds').result.hint).toBeNull();
    expect(fromTimestamp('1700000000000', 'milliseconds').result.hint).toBeNull();
    expect(fromTimestamp('0', 'milliseconds').result.hint).toBeNull();
  });
});

describe('toTimestamp', () => {
  it('converts a UTC date', () => {
    expect(toTimestamp({ date: '2023-11-14', time: '22:13:20', zoneMode: 'utc' }).result).toMatchObject({ seconds: 1700000000, ms: 1700000000000 });
    expect(toTimestamp({ date: '1970-01-01', time: '', zoneMode: 'utc' }).result.seconds).toBe(0);
  });

  it('gives a negative timestamp before 1970', () => {
    expect(toTimestamp({ date: '1969-12-31', time: '23:59:59', zoneMode: 'utc' }).result.seconds).toBe(-1);
  });

  it('converts a local date using the device time zone', () => {
    const expected = new Date(2023, 10, 14, 22, 13, 20).getTime();
    expect(toTimestamp({ date: '2023-11-14', time: '22:13:20', zoneMode: 'local' }).result.ms).toBe(expected);
  });

  it('defaults to midnight without a time', () => {
    expect(toTimestamp({ date: '2023-11-14', time: '', zoneMode: 'local' }).result.ms).toBe(new Date(2023, 10, 14).getTime());
  });

  it('rejects missing and invalid values', () => {
    expect(toTimestamp({ date: '', time: '', zoneMode: 'utc' }).errors.date).toBe('Please choose a date.');
    expect(toTimestamp({ date: '2023-02-29', time: '', zoneMode: 'utc' }).errors.date).toMatch(/real date/);
    expect(toTimestamp({ date: '2023-01-01', time: '25:00', zoneMode: 'utc' }).errors.time).toBe('Please enter a valid time.');
  });

  it('round-trips with fromTimestamp', () => {
    const { result } = toTimestamp({ date: '2031-03-09', time: '02:30:15', zoneMode: 'local' });
    expect(fromTimestamp(String(result.seconds), 'seconds').result.ms).toBe(result.ms);
  });
});

describe('current time helpers', () => {
  const NOW = Date.UTC(2026, 10, 3, 9, 5, 7, 250);

  it('gives the timestamp in the chosen unit', () => {
    expect(currentTimestamp(NOW, 'seconds')).toBe(String(Math.floor(NOW / 1000)));
    expect(currentTimestamp(NOW, 'milliseconds')).toBe(String(NOW));
  });

  it('gives the date and time in the chosen zone', () => {
    expect(currentDateTime(NOW, 'utc')).toEqual({ date: '2026-11-03', time: '09:05:07' });
    const local = new Date(NOW);
    expect(currentDateTime(NOW, 'local').time).toBe(`${String(local.getHours()).padStart(2, '0')}:05:07`.replace(':05:', `:${String(local.getMinutes()).padStart(2, '0')}:`));
  });
});

describe('describeInstant', () => {
  it('rounds seconds down for negative part seconds', () => {
    expect(describeInstant(-1).seconds).toBe(-1);
    expect(describeInstant(999).seconds).toBe(0);
  });

  it('includes the time zone in local time', () => {
    expect(describeInstant(0).local.length).toBeGreaterThan(10);
  });
});

describe('buildResultText', () => {
  it('lists every format', () => {
    const text = buildResultText(fromTimestamp('1700000000', 'seconds').result);
    expect(text).toContain('Unix timestamp (seconds): 1700000000');
    expect(text).toContain('Unix timestamp (milliseconds): 1700000000000');
    expect(text).toContain('UTC: Tue, 14 Nov 2023 22:13:20 GMT');
    expect(text).toContain('Local: ');
    expect(text).toContain('ISO 8601: 2023-11-14T22:13:20.000Z');
  });
});
