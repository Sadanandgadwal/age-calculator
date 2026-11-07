import { describe, expect, it } from 'vitest';
import { MAX_PAGES, choosePages, getFacts, imageName, scaleFor } from './logic.js';

describe('choosePages', () => {
  it('takes every page when empty', () => expect(choosePages('', 3)).toEqual({ pages: [0, 1, 2], isLimited: false }));
  it('limits very long PDFs', () => {
    const choice = choosePages('', MAX_PAGES + 5);
    expect(choice.pages).toHaveLength(MAX_PAGES);
    expect(choice.isLimited).toBe(true);
  });
  it('reads ranges', () => expect(choosePages('2-3', 5).pages).toEqual([1, 2]));
  it('passes on errors', () => expect(choosePages('9', 5).error).toMatch(/does not exist/));
  it('rejects too many pages', () => expect(choosePages('1-201', 300).error).toMatch(/up to 200 pages/));
});

describe('scaleFor', () => {
  it('uses the DPI', () => expect(scaleFor(150, 595.28, 841.89)).toBeCloseTo(150 / 72));
  it('caps huge pages at 40 megapixels', () => {
    const scale = scaleFor(300, 2384, 3370);
    expect(2384 * scale * 3370 * scale).toBeCloseTo(40_000_000, -2);
  });
});

describe('output', () => {
  it('names each image', () => expect(imageName('report.pdf', 2)).toBe('report-page-3.jpg'));
  it('lists the facts', () =>
    expect(getFacts([0, 1, 4], 300, { size: 2048 }, true)).toEqual([
      { label: 'Images', value: '3' },
      { label: 'Pages', value: '1-2, 5' },
      { label: 'Resolution', value: '300 DPI' },
      { label: 'ZIP size', value: '2 KB' },
    ]));
});
