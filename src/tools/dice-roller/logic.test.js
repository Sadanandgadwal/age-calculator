import { describe, expect, it } from 'vitest';
import { DICE, buildReport, buildResultText, rollDice, summarise, validate } from './logic.js';

describe('validate', () => {
  it.each(['', '0', '101', '1.5', 'x'])('rejects %j', (text) => {
    expect(validate(text).error).toBe(text === '1.5' ? 'Please enter a whole number.' : text === 'x' ? 'Please enter a valid number, without commas or symbols.' : 'Please enter 1 to 100 dice.');
  });
});

describe('rollDice', () => {
  it.each(DICE.map(({ sides }) => [sides]))('stays in range and reaches both ends on a d%i', (sides) => {
    const { rolls } = rollDice(100, sides, (limit) => limit - 1);
    expect(new Set(rolls)).toEqual(new Set([sides]));
    expect(new Set(rollDice(100, sides, () => 0).rolls)).toEqual(new Set([1]));
    expect(rollDice(100, sides).rolls.every((roll) => roll >= 1 && roll <= sides)).toBe(true);
  });

  it('reaches every side', () => {
    const seen = new Set();
    for (let run = 0; run < 20; run += 1) rollDice(100, 6).rolls.forEach((roll) => seen.add(roll));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('output', () => {
  const result = summarise([2, 6, 4], 6);

  it('summarises the rolls', () => {
    expect(result).toMatchObject({ total: 12, highest: 6, lowest: 2 });
  });

  it('builds the copied text and report', () => {
    expect(buildResultText(result)).toBe('3d6: 2, 6, 4\nTotal: 12');
    const report = buildReport(result);
    expect(report.inputs[0].value).toBe('3d6');
    expect(report.results[0]).toEqual({ label: 'Total', value: '12' });
    expect(report.details[2].value).toBe('4');
    expect(report.text.value).toBe('2, 6, 4');
  });
});
