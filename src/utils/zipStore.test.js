import { describe, expect, it } from 'vitest';
import { crc32, createZip } from './zipStore.js';

const bytesOf = async (blob) => new Uint8Array(await blob.arrayBuffer());

describe('crc32', () => {
  it('matches the standard check value', () => expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926));
  it('is zero for nothing', () => expect(crc32(new Uint8Array())).toBe(0));
});

describe('createZip', () => {
  it('writes a valid store-only archive', async () => {
    const zip = await bytesOf(createZip([{ name: 'a.txt', data: 'hello' }, { name: 'b.bin', data: Uint8Array.from([1, 2, 3]) }], new Date(2026, 10, 5, 12, 30, 10)));
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(14, true)).toBe(crc32(new TextEncoder().encode('hello')));
    expect(new TextDecoder().decode(zip.subarray(30, 35))).toBe('a.txt');
    expect(new TextDecoder().decode(zip.subarray(35, 40))).toBe('hello');
    const end = zip.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 10, true)).toBe(2);
    const centralOffset = view.getUint32(end + 16, true);
    expect(view.getUint32(centralOffset, true)).toBe(0x02014b50);
    expect(view.getUint32(centralOffset + 46 + 5, true)).toBe(0x02014b50);
    expect(view.getUint32(centralOffset + 46 + 5 + 42, true)).toBe(40);
    expect(view.getUint16(10, true)).toBe((12 << 11) | (30 << 5) | 5);
    expect(view.getUint16(12, true)).toBe((46 << 9) | (11 << 5) | 5);
  });

  it('marks names as UTF-8', async () => {
    const zip = await bytesOf(createZip([{ name: 'फोटो.txt', data: '' }]));
    expect(new DataView(zip.buffer).getUint16(6, true)).toBe(0x0800);
  });
});
