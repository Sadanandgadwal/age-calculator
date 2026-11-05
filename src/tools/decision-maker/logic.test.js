import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, formatChance, pickOption, readOptions } from './logic.js';

describe('readOptions', () => {
  it('reads plain and weighted options, skipping blanks', () => {
    expect(readOptions(' Pizza | 3 \n\nSalad\n')).toEqual({ options: [{ name: 'Pizza', weight: 3 }, { name: 'Salad', weight: 1 }] });
  });

  it('needs two options', () => {
    expect(readOptions('Only one').error).toContain('at least two');
    expect(readOptions('').error).toContain('at least two');
    expect(readOptions('Same\nSame').error).toContain('at least two');
  });

  it('adds together repeated options', () => {
    expect(readOptions('A\nA | 2\nB').options).toEqual([{ name: 'A', weight: 3 }, { name: 'B', weight: 1 }]);
  });

  it.each(['A | 0', 'A | -1', 'A | 1.5', 'A | 1001', 'A | many'])('rejects the weight in %j, naming the line', (line) => {
    expect(readOptions(`B\n${line}`).error).toContain('Line 2');
  });
});

describe('pickOption', () => {
  const options = [{ name: 'A', weight: 3 }, { name: 'B', weight: 1 }];

  it('maps each position to the right option', () => {
    expect(['0', '1', '2', '3'].map((position) => pickOption(options, () => Number(position)).winner)).toEqual(['A', 'A', 'A', 'B']);
  });

  it('asks for a choice across the total weight', () => {
    let limit;
    pickOption(options, (value) => {
      limit = value;
      return 0;
    });
    expect(limit).toBe(4);
  });

  it('works out the chances', () => {
    const result = pickOption(options, () => 3);
    expect(result.options.map(({ chance }) => chance)).toEqual([75, 25]);
    expect(result.winnerChance).toBe(25);
  });

  it('follows the weights over many picks', () => {
    let wins = 0;
    for (let run = 0; run < 2000; run += 1) if (pickOption(options).winner === 'A') wins += 1;
    expect(wins).toBeGreaterThan(1350);
    expect(wins).toBeLessThan(1650);
  });
});

describe('output', () => {
  const result = { ...pickOption([{ name: 'A', weight: 1 }, { name: 'B', weight: 2 }], () => 0), question: 'Which?' };

  it('rounds chances', () => {
    expect(formatChance(100 / 3)).toBe('33.33%');
  });

  it('builds the copied text and report', () => {
    expect(buildResultText(result)).toBe('Question: Which?\nDecision: A\nChance: 33.33%');
    const report = buildReport(result);
    expect(report.results[0]).toEqual({ label: 'Decision', value: 'A' });
    expect(report.table.rows[1]).toEqual(['B', '2', '66.67%']);
    expect(buildReport({ ...result, question: '' }).inputs).toBeNull();
  });
});
