import { describe, expect, it } from 'vitest';
import { CHARTS, DEFAULTS } from './logic.js';
import { buildSizeReport, buildSizeText, findRow, sizesFor } from '../../utils/sizeChart.js';

describe('shoe charts', () => {
  it('uses the same columns for men and women', () => {
    expect(CHARTS[0].columns).toEqual(CHARTS[1].columns);
    for (const chart of CHARTS) for (const row of chart.rows) expect(row).toHaveLength(5);
  });

  it('keeps Indian sizes equal to UK sizes and lengths increasing', () => {
    for (const chart of CHARTS) {
      for (const row of chart.rows) expect(row[3]).toBe(row[0]);
      const lengths = chart.rows.map((row) => Number(row[4]));
      expect([...lengths].sort((a, b) => a - b)).toEqual(lengths);
    }
  });

  it('finds matching sizes', () => {
    expect(findRow(CHARTS[0], 0, '8')).toEqual([
      { label: 'UK', value: '8' },
      { label: 'US', value: '8.5' },
      { label: 'EU', value: '42' },
      { label: 'India', value: '8' },
      { label: 'Foot length (cm)', value: '26.5' },
    ]);
    expect(findRow(CHARTS[1], 1, '7')[2]).toEqual({ label: 'EU', value: '37.5' });
    expect(sizesFor(CHARTS[0], 2)).toContain('42.5');
    expect(findRow(CHARTS[0], 0, DEFAULTS.size)).not.toBeNull();
  });

  it('builds the text and report', () => {
    const matches = findRow(CHARTS[0], 0, '8');
    expect(buildSizeText(CHARTS[0], matches, 0, 'Note').split('\n')[0]).toBe('Men’s shoes: UK 8 = US 8.5, EU 42, India 8, Foot length (cm) 26.5');
    const report = buildSizeReport(CHARTS[0], matches, 0, 'Note');
    expect(report.inputs).toEqual([{ label: 'UK', value: '8' }]);
    expect(report.results).toHaveLength(4);
    expect(report.table.rows).toHaveLength(14);
  });
});
