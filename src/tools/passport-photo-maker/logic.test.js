import { describe, expect, it } from 'vitest';
import { PAPERS, PRESETS, buildReport, getFacts, getPreset, headGuide, isLowResolution, mmToPx, readCustomSize, setJpegDpi, sheetLayout } from './logic.js';

describe('presets', () => {
  it.each([
    ['india', 35, 45],
    ['us', 51, 51],
    ['uk', 35, 45],
    ['canada', 50, 70],
    ['schengen', 35, 45],
  ])('%s is %i × %i mm', (id, width, height) => expect(getPreset(id)).toMatchObject({ width, height }));
  it('has official head heights where published', () => {
    expect(getPreset('us').head).toEqual([25, 35]);
    expect(getPreset('uk').head).toEqual([29, 34]);
    expect(getPreset('canada').head).toEqual([31, 36]);
  });
  it('lists every preset once', () => expect(new Set(PRESETS.map((preset) => preset.id)).size).toBe(PRESETS.length));
});

describe('mmToPx', () => {
  it.each([
    [35, 413],
    [45, 531],
    [51, 602],
    [25.4, 300],
    [210, 2480],
    [297, 3508],
    [101.6, 1200],
    [152.4, 1800],
  ])('%f mm is %i px', (mm, px) => expect(mmToPx(mm)).toBe(px));
});

describe('readCustomSize', () => {
  it('accepts decimals', () => expect(readCustomSize('30', '40.5').size).toEqual({ width: 30, height: 40.5 }));
  it('accepts the limits', () => expect(readCustomSize('20', '100').size).toEqual({ width: 20, height: 100 }));
  it.each(['19.9', '100.1', '', 'abc', '-30', '1e2'])('rejects %s', (value) => expect(readCustomSize(value, '40').errors.width).toMatch(/20 to 100 mm/));
  it('reports the height too', () => expect(readCustomSize('30', '0').errors.height).toMatch(/20 to 100 mm/));
});

describe('sheetLayout', () => {
  const four = PAPERS[0];
  const a4 = PAPERS[1];

  it('fits 35 × 45 mm photos on 4 × 6 in', () => {
    const layout = sheetLayout(four, { width: 35, height: 45 });
    expect([layout.columns, layout.rows, layout.count]).toEqual([2, 3, 6]);
  });
  it('fits 35 × 45 mm photos on A4', () => expect(sheetLayout(a4, { width: 35, height: 45 }).count).toBe(30));
  it('fits 2 × 2 in photos on 4 × 6 in', () => expect(sheetLayout(four, { width: 51, height: 51 }).count).toBe(2));
  it('keeps every photo on the paper', () => {
    for (const paper of PAPERS) {
      for (const preset of PRESETS.filter((item) => item.width)) {
        const layout = sheetLayout(paper, preset);
        expect(layout.count).toBeGreaterThan(0);
        for (const position of layout.positions) {
          expect(position.x).toBeGreaterThanOrEqual(4 - 1e-9);
          expect(position.y).toBeGreaterThanOrEqual(4 - 1e-9);
          expect(position.x + preset.width).toBeLessThanOrEqual(paper.width - 4 + 1e-9);
          expect(position.y + preset.height).toBeLessThanOrEqual(paper.height - 4 + 1e-9);
        }
      }
    }
  });
  it('keeps photos apart', () => {
    const [first, second] = sheetLayout(four, { width: 35, height: 45 }).positions;
    expect(second.x - first.x).toBe(37);
  });
  it('fits nothing when the photo is larger than the paper', () => expect(sheetLayout({ width: 30, height: 30 }, { width: 35, height: 45 }).count).toBe(0));
});

describe('headGuide', () => {
  it('sizes the oval from the middle of the range', () => {
    const guide = headGuide({ width: 35, height: 45 }, [29, 34]);
    expect(guide.height).toBeCloseTo(31.5 / 45);
    expect(guide.top).toBeGreaterThan(0);
    expect(guide.top + guide.height).toBeLessThan(1);
  });
  it('has no guide without a published range', () => expect(headGuide({ width: 35, height: 45 }, null)).toBeNull());
});

describe('setJpegDpi', () => {
  const jfif = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
  it('writes 300 DPI', () => expect(Array.from(setJpegDpi(jfif).subarray(13, 18))).toEqual([1, 1, 44, 1, 44]));
  it('does not change the original bytes', () => {
    setJpegDpi(jfif);
    expect(jfif[13]).toBe(0);
  });
  it('leaves other files alone', () => {
    const other = Uint8Array.from([0xff, 0xd8, 0xff, 0xe1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(setJpegDpi(other)).toBe(other);
  });
});

describe('output', () => {
  const crop = { x: 0, y: 0, width: 800, height: 1029 };
  it('lists the facts', () => {
    expect(getFacts(getPreset('uk'), { width: 35, height: 45 }, crop, PAPERS[0], 6)).toEqual([
      { label: 'Photo size', value: '35 × 45 mm' },
      { label: 'Pixels', value: '413 × 531 px at 300 DPI' },
      { label: 'Head, chin to crown', value: '29 to 34 mm' },
      { label: 'Print sheet', value: '6 photos on 4 × 6 in' },
      { label: 'Taken from your photo', value: '800 × 1029 px' },
    ]);
  });
  it('leaves out an unpublished head height', () => expect(getFacts(getPreset('india'), { width: 35, height: 45 }, crop, PAPERS[0], 6).map((fact) => fact.label)).not.toContain('Head, chin to crown'));
  it('warns about a small selection', () => {
    expect(isLowResolution({ width: 300 }, { width: 35, height: 45 })).toBe(true);
    expect(isLowResolution({ width: 320 }, { width: 35, height: 45 })).toBe(false);
  });
  it('builds the report', () => {
    const report = buildReport(getPreset('india'), { width: 35, height: 45 }, 12);
    expect(report.inputs).toEqual([
      { label: 'Document', value: 'India passport' },
      { label: 'Photo size', value: '35 × 45 mm' },
    ]);
    expect(report.results).toEqual([{ label: 'Photos on this page', value: '12' }]);
    expect(report.notes[0]).toMatch(/Actual size/);
  });
});
