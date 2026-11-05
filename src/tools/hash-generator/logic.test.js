import { describe, expect, it } from 'vitest';
import { applyCase, buildReport, buildResultText, computeHashes } from './logic.js';

const value = (hashes, label) => hashes.find((hash) => hash.label === label).value;

describe('computeHashes', () => {
  it('matches the published values for "abc"', async () => {
    const hashes = await computeHashes('abc');
    expect(value(hashes, 'MD5 (not secure)')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(value(hashes, 'SHA-1 (not secure)')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(value(hashes, 'SHA-256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(value(hashes, 'SHA-384')).toBe('cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7');
    expect(value(hashes, 'SHA-512')).toBe('ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
  });

  it('hashes as UTF-8', async () => {
    const hashes = await computeHashes('é');
    expect(value(hashes, 'MD5 (not secure)')).toBe('66ddcd97cfdeabb2f6fb8a999b4bc76f');
    expect(value(hashes, 'SHA-256')).toBe('4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c');
  });
});

describe('output', () => {
  const hashes = [{ label: 'SHA-256', value: 'ab' }, { label: 'MD5 (not secure)', value: 'cd' }];

  it('can use uppercase', () => {
    expect(applyCase(hashes, true)[0].value).toBe('AB');
    expect(applyCase(hashes, false)[0].value).toBe('ab');
  });

  it('builds the copied text and report', () => {
    expect(buildResultText(hashes)).toBe('SHA-256: ab\nMD5 (not secure): cd');
    const report = buildReport('hello', hashes);
    expect(report.results[0].value).toBe('ab');
    expect(report.details).toHaveLength(1);
    expect(report.notes[0]).toContain('MD5 and SHA-1');
  });
});
