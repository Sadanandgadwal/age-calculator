import { describe, expect, it } from 'vitest';
import { buildReport, createUuid, generateUuids, validate } from './logic.js';

describe('createUuid', () => {
  it('makes valid version 4 UUIDs', () => {
    for (let run = 0; run < 100; run += 1) {
      expect(createUuid('v4')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });

  it('makes valid version 7 UUIDs holding the time', () => {
    const now = Date.UTC(2026, 0, 2, 3, 4, 5, 678);
    const uuid = createUuid('v7', now);
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(Number.parseInt(uuid.replace(/-/g, '').slice(0, 12), 16)).toBe(now);
  });

  it('sorts version 7 by time', () => {
    expect(createUuid('v7', 1000) < createUuid('v7', 2000)).toBe(true);
  });

  it('does not repeat', () => {
    expect(new Set(generateUuids({ version: 'v4', count: 1000 })).size).toBe(1000);
  });
});

describe('generateUuids', () => {
  it('follows the shape options', () => {
    const [uuid] = generateUuids({ version: 'v4', count: 1, uppercase: true, noHyphens: true });
    expect(uuid).toMatch(/^[0-9A-F]{32}$/);
  });
});

describe('validate', () => {
  it.each(['', '0', '1001', '1.5', 'x'])('rejects %j', (text) => {
    expect(validate(text).error).toBeTruthy();
  });

  it('accepts a count', () => {
    expect(validate('1000')).toEqual({ count: 1000 });
  });
});

describe('buildReport', () => {
  it('lists the settings and every UUID', () => {
    const report = buildReport({ uuids: ['a', 'b'], version: 'v7', uppercase: false, noHyphens: true });
    expect(report.inputs[0].value).toBe('Version 7 (time-ordered)');
    expect(report.inputs[2].value).toBe('No');
    expect(report.text.value).toBe('a\nb');
    expect(report.text.mono).toBe(true);
  });
});
