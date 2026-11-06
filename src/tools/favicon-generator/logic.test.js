import { describe, expect, it } from 'vitest';
import { ICONS, buildIco, buildManifest, isHexColor, placement } from './logic.js';

describe('placement', () => {
  it('crops the center of a wide image to a square', () => expect(placement(400, 200, 32, 'cover')).toEqual({ source: { x: 100, y: 0, width: 200, height: 200 }, target: { x: 0, y: 0, width: 32, height: 32 } }));
  it('crops the center of a tall image', () => expect(placement(200, 400, 32, 'cover').source).toEqual({ x: 0, y: 100, width: 200, height: 200 }));
  it('fits a wide image inside', () => expect(placement(400, 200, 32, 'contain')).toEqual({ source: { x: 0, y: 0, width: 400, height: 200 }, target: { x: 0, y: 8, width: 32, height: 16 } }));
  it('fills a square exactly either way', () => {
    expect(placement(100, 100, 48, 'contain').target).toEqual({ x: 0, y: 0, width: 48, height: 48 });
    expect(placement(100, 100, 48, 'cover').target).toEqual({ x: 0, y: 0, width: 48, height: 48 });
  });
});

describe('buildIco', () => {
  const images = [
    { size: 16, bytes: Uint8Array.from([1, 2, 3]) },
    { size: 32, bytes: Uint8Array.from([4, 5]) },
    { size: 256, bytes: Uint8Array.from([6]) },
  ];
  const ico = buildIco(images);
  const view = new DataView(ico.buffer);

  it('writes the header', () => {
    expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, 3]);
  });
  it('writes each entry', () => {
    expect([ico[6], ico[7], view.getUint16(10, true), view.getUint16(12, true), view.getUint32(14, true), view.getUint32(18, true)]).toEqual([16, 16, 1, 32, 3, 54]);
    expect(view.getUint32(22 + 12, true)).toBe(57);
  });
  it('writes 256 as zero', () => expect([ico[38], ico[39]]).toEqual([0, 0]));
  it('places the image data', () => expect(Array.from(ico.subarray(54))).toEqual([1, 2, 3, 4, 5, 6]));
});

describe('buildManifest', () => {
  it('includes the name and icons', () => {
    const manifest = JSON.parse(buildManifest('  ToolNest  ', '#16697a'));
    expect(manifest.name).toBe('ToolNest');
    expect(manifest.short_name).toBe('ToolNest');
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512']);
    expect(manifest.theme_color).toBe('#16697a');
  });
  it('shortens a long short name', () => expect(JSON.parse(buildManifest('A very long website name', '#ffffff')).short_name).toBe('A very long'));
  it('leaves out an empty name', () => expect(JSON.parse(buildManifest('', '#ffffff'))).not.toHaveProperty('name'));
  it('escapes quotes in the name', () => expect(JSON.parse(buildManifest('Say "hi"', '#ffffff')).name).toBe('Say "hi"'));
});

it('checks colors', () => {
  expect(isHexColor('#a1B2c3')).toBe(true);
  expect(isHexColor('red')).toBe(false);
});

it('makes a solid Apple icon only', () => expect(ICONS.filter((icon) => icon.opaque).map((icon) => icon.size)).toEqual([180]));
