import { describe, expect, it } from 'vitest';
import { buildResultText, calculateSplit, describeShares, evaluate } from './logic.js';

const run = (overrides) => evaluate({ bill: '1000', people: '5', tax: '', tip: '', roundUp: false, ...overrides });

describe('calculateSplit', () => {
  it('splits evenly', () => {
    expect(calculateSplit({ bill: 1200, people: 4 })).toMatchObject({ total: 120000, share: 30000, baseShare: 30000, extraPayers: 0, leftover: 0 });
  });

  it('adds tax and tip, both on the bill amount', () => {
    expect(calculateSplit({ bill: 1000, people: 5, taxRate: 5, tipRate: 10 })).toMatchObject({ tax: 5000, tip: 10000, total: 115000, share: 23000 });
  });

  it('handles one person', () => {
    expect(calculateSplit({ bill: 99.99, people: 1 })).toMatchObject({ total: 9999, share: 9999, extraPayers: 0 });
  });

  it('shares leftover paise so the total is exact', () => {
    const result = calculateSplit({ bill: 100, people: 3 });
    expect(result).toMatchObject({ share: 3334, baseShare: 3333, extraPayers: 1 });
    expect(result.baseShare * (result.people - result.extraPayers) + result.share * result.extraPayers).toBe(result.total);
  });

  it('always adds up to the total', () => {
    for (const [bill, people] of [[100, 7], [999.99, 13], [0.05, 3], [1234.56, 11]]) {
      const { baseShare, share, extraPayers, total } = calculateSplit({ bill, people, taxRate: 5, tipRate: 12.5 });
      expect(baseShare * (people - extraPayers) + (extraPayers > 0 ? share * extraPayers : 0)).toBe(total);
    }
  });

  it('handles more people than paise', () => {
    expect(calculateSplit({ bill: 0.01, people: 3 })).toMatchObject({ total: 1, share: 1, baseShare: 0, extraPayers: 1 });
  });

  it('rounds decimals to the paisa', () => {
    expect(calculateSplit({ bill: 99.99, people: 1, taxRate: 18 })).toMatchObject({ tax: 1800, total: 11799 });
  });

  describe('rounding up', () => {
    it('rounds each share up and reports what is left over', () => {
      expect(calculateSplit({ bill: 100, people: 3, roundUp: true })).toMatchObject({ share: 3400, collected: 10200, leftover: 200, extraPayers: 0 });
    });

    it('changes nothing when shares are already whole', () => {
      expect(calculateSplit({ bill: 1200, people: 4, roundUp: true })).toMatchObject({ share: 30000, leftover: 0 });
    });

    it('never collects less than the total', () => {
      const result = calculateSplit({ bill: 999.99, people: 7, roundUp: true });
      expect(result.collected).toBeGreaterThanOrEqual(result.total);
    });
  });
});

describe('describeShares', () => {
  it('stays quiet for an even split', () => {
    expect(describeShares(calculateSplit({ bill: 1200, people: 4 }))).toBeNull();
  });

  it('explains uneven shares with correct wording', () => {
    expect(describeShares(calculateSplit({ bill: 100, people: 3 }))).toBe("The bill doesn't divide evenly: 1 person pays ₹33.34 and 2 people pay ₹33.33.");
    expect(describeShares(calculateSplit({ bill: 100.01, people: 3 }))).toBe("The bill doesn't divide evenly: 2 people pay ₹33.34 and 1 person pays ₹33.33.");
  });

  it('explains the amount left over', () => {
    expect(describeShares(calculateSplit({ bill: 100, people: 3, roundUp: true }))).toBe('Everyone pays ₹34.00, which leaves ₹2.00 over after paying the bill.');
  });
});

describe('evaluate', () => {
  it('treats blank tax and tip as zero', () => {
    expect(run({}).result).toMatchObject({ taxRate: 0, tipRate: 0, total: 100000 });
  });

  it('uses tax, tip and rounding', () => {
    expect(run({ tax: '5', tip: '10' }).result.total).toBe(115000);
    expect(run({ people: '3', roundUp: true }).result.share).toBe(33400);
  });

  it.each([
    ['bill', '', 'Please enter the bill amount.'],
    ['bill', '0', 'The bill amount must be greater than 0.'],
    ['bill', '-5', 'The bill amount must be greater than 0.'],
    ['bill', 'abc', 'Please enter a valid number, without commas or symbols.'],
    ['bill', '10000000000001', 'This amount is too large to calculate.'],
    ['people', '', 'Please enter the number of people.'],
    ['people', '0', 'Please enter at least 1 person.'],
    ['people', '-1', 'Please enter at least 1 person.'],
    ['people', '2.5', 'Please enter a whole number.'],
    ['people', '1001', 'Please enter 1000 people or fewer.'],
    ['tax', '-1', 'The tax must be between 0 and 100.'],
    ['tax', '101', 'The tax must be between 0 and 100.'],
    ['tax', 'abc', 'Please enter a valid number, without commas or symbols.'],
    ['tip', '-1', 'The tip must be between 0 and 100.'],
    ['tip', '101', 'The tip must be between 0 and 100.'],
  ])('rejects %s of %j', (field, value, message) => {
    const { errors, result } = run({ [field]: value });
    expect(errors[field]).toBe(message);
    expect(result).toBeUndefined();
  });
});

describe('buildResultText', () => {
  it('summarises the split, with the note when needed', () => {
    const text = buildResultText(run({ bill: '100', people: '3' }).result);
    expect(text).toContain('Each person pays: ₹33.34');
    expect(text).toContain('1 person pays ₹33.34');
    expect(buildResultText(run({}).result)).not.toContain('evenly');
  });
});
