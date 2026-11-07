import { describe, expect, it } from 'vitest';
import { CHARTS, DEFAULTS } from './logic.js';
import { describeRow, findRow, sizesFor } from '../../utils/sizeChart.js';

describe('clothing charts', () => {
  it('uses the same number of columns for each chart', () => {
    for (const chart of CHARTS) {
      expect(chart.columns).toHaveLength(6);
      for (const row of chart.rows) expect(row).toHaveLength(6);
      chart.columns.forEach((_, index) => expect(new Set(sizesFor(chart, index)).size).toBe(chart.rows.length));
    }
  });

  it('keeps the women’s pattern of US + 4 = UK', () => {
    for (const row of CHARTS[1].rows) expect(Number(row[3])).toBe(Number(row[2]) + 4);
  });

  it('finds matching sizes', () => {
    expect(describeRow(CHARTS[0], findRow(CHARTS[0], 0, 'M'), 0)).toBe('Men’s shirts and tops: Letter M = India 40, US 38, UK 38, EU 48, Chest (cm) 96–101');
    expect(findRow(CHARTS[1], 3, '10')[4]).toEqual({ label: 'EU', value: '38' });
    expect(findRow(CHARTS[0], 0, DEFAULTS.size)).not.toBeNull();
  });
});
