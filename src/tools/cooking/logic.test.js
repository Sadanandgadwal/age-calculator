import { describe, expect, it } from 'vitest';
import { NOTE, buildReport, buildResultText, convert, formatAmount, getIngredient } from './logic.js';

const output = (...args) => convert(...args).result.output;

describe('cooking conversions', () => {
  it('converts volumes and weights directly', () => {
    expect(output('2', 'tbsp', 'tsp', 'water')).toBeCloseTo(6, 10);
    expect(output('1', 'cup', 'tbsp', 'flour')).toBeCloseTo(16, 10);
    expect(output('1', 'lb', 'g', 'flour')).toBeCloseTo(453.59237, 6);
    expect(output('1', 'mcup', 'ml', 'water')).toBe(250);
  });

  it('uses the ingredient between volume and weight', () => {
    expect(output('1', 'cup', 'g', 'flour')).toBeCloseTo(125.39, 2);
    expect(output('1', 'cup', 'g', 'honey')).toBeCloseTo(335.96, 2);
    expect(output('500', 'g', 'cup', 'sugar')).toBeCloseTo(2.486, 3);
  });

  it('ignores the ingredient when it does not matter', () => {
    expect(convert('1', 'cup', 'ml', 'honey').result.ingredient).toBeNull();
    expect(getIngredient('nope').id).toBe('water');
  });

  it('checks the amount', () => {
    expect(convert('', 'cup', 'g', 'flour')).toEqual({});
    expect(convert('abc', 'cup', 'g', 'flour').error).toBe('Please enter a number, without commas or symbols.');
    expect(convert('-1', 'cup', 'g', 'flour').error).toBe("Amounts can't be negative.");
  });

  it('formats small amounts and builds the text and report', () => {
    expect(formatAmount(0.001)).toBe('< 0.01');
    const { result } = convert('1', 'cup', 'g', 'flour');
    expect(buildResultText(result)).toBe(`1 cup of all-purpose flour (maida) = 125.39 g\n1 US cup of all-purpose flour (maida) ≈ 125.39 g\n${NOTE}`);
    const report = buildReport(result);
    expect(report.inputs[2]).toEqual({ label: 'Ingredient', value: 'All-purpose flour (maida)' });
    expect(buildReport(convert('2', 'tbsp', 'tsp', 'water').result).notes).toEqual([]);
  });
});
