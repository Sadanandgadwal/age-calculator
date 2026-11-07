import { describe, expect, it } from 'vitest';
import { PAPERS, buildReport, buildResultText, getPaper, measure } from './logic.js';

describe('paper sizes', () => {
  it('lists the standard sizes', () => {
    expect(PAPERS.find(({ id }) => id === 'a4')).toMatchObject({ width: 210, height: 297 });
    expect(PAPERS.find(({ id }) => id === 'b5')).toMatchObject({ width: 176, height: 250 });
    expect(PAPERS.filter(({ group }) => group === 'ISO A series')).toHaveLength(11);
    expect(getPaper('nope').id).toBe('a4');
  });

  it('halves each A size to the next', () => {
    const a = PAPERS.filter(({ group }) => group === 'ISO A series');
    for (let index = 1; index < a.length; index += 1) expect(a[index].height).toBe(a[index - 1].width);
  });

  it('measures in every unit', () => {
    expect(measure('a4', 'portrait', 300)).toMatchObject({ mm: '210 × 297 mm', cm: '21 × 29.7 cm', inches: '8.27 × 11.69 in', points: '595.28 × 841.89 pt', pixels: '2,480 × 3,508 px', area: '623.7 cm²' });
  });

  it('turns the page for landscape', () => {
    expect(measure('letter', 'landscape', 96)).toMatchObject({ inches: '11 × 8.5 in', points: '792 × 612 pt', pixels: '1,056 × 816 px' });
  });

  it('builds the text and report', () => {
    const result = measure('a4', 'portrait', 300);
    expect(buildResultText(result).split('\n').slice(0, 2)).toEqual(['A4, portrait', 'Millimetres: 210 × 297 mm']);
    expect(buildReport(result).inputs).toEqual([
      { label: 'Paper', value: 'A4' },
      { label: 'Orientation', value: 'Portrait' },
      { label: 'Resolution', value: '300 DPI' },
    ]);
  });
});
