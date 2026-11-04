import { describe, expect, it } from 'vitest';
import { MODES, buildResultText, evaluate } from './logic.js';

const result = (mode, a, b) => evaluate(mode, a, b).result;
const errors = (mode, a, b) => evaluate(mode, a, b).errors;

describe('modes', () => {
  it('has all four modes', () => {
    expect(MODES.map(({ id }) => id)).toEqual(['percent-off', 'amount-off', 'find-percent', 'find-original']);
  });
});

describe('percentage off', () => {
  it('finds the final price and savings', () => {
    expect(result('percent-off', '1000', '20')).toMatchObject({ original: 100000, sale: 80000, saved: 20000, percent: 20 });
  });

  it('handles 0% and 100%', () => {
    expect(result('percent-off', '1000', '0')).toMatchObject({ sale: 100000, saved: 0 });
    expect(result('percent-off', '1000', '100')).toMatchObject({ sale: 0, saved: 100000 });
  });

  it('handles decimals and rounds to the paisa', () => {
    expect(result('percent-off', '99.99', '12.5')).toMatchObject({ original: 9999, saved: 1250, sale: 8749 });
    expect(result('percent-off', '19.99', '33')).toMatchObject({ saved: 660, sale: 1339 });
  });

  it('always adds back to the original price', () => {
    for (const [price, percent] of [['99.99', '33.33'], ['1234.56', '7.5'], ['0.05', '50']]) {
      const { original, sale, saved } = result('percent-off', price, percent);
      expect(sale + saved).toBe(original);
    }
  });
});

describe('amount off', () => {
  it('finds the final price and percentage', () => {
    expect(result('amount-off', '1000', '250')).toMatchObject({ sale: 75000, saved: 25000, percent: 25 });
  });

  it('handles a discount equal to the price', () => {
    expect(result('amount-off', '1000', '1000')).toMatchObject({ sale: 0, percent: 100 });
  });

  it('rejects a discount above the price', () => {
    expect(errors('amount-off', '1000', '1001').b).toBe("The discount can't be more than the original price.");
  });
});

describe('finding the discount', () => {
  it('finds the percentage', () => {
    expect(result('find-percent', '1000', '750')).toMatchObject({ percent: 25, saved: 25000 });
    expect(result('find-percent', '3', '2').percent).toBe(33.33);
  });

  it('handles no discount and a free item', () => {
    expect(result('find-percent', '1000', '1000').percent).toBe(0);
    expect(result('find-percent', '1000', '0').percent).toBe(100);
  });

  it('rejects a sale price above the original', () => {
    expect(errors('find-percent', '1000', '1001').b).toBe("The sale price can't be more than the original price.");
  });
});

describe('finding the original price', () => {
  it('reverses a discount', () => {
    expect(result('find-original', '800', '20')).toMatchObject({ original: 100000, sale: 80000, saved: 20000, percent: 20 });
  });

  it('handles no discount', () => {
    expect(result('find-original', '800', '0').original).toBe(80000);
  });

  it('rejects 100%, which has no answer', () => {
    expect(errors('find-original', '800', '100').b).toBe('The discount must be 0 or more, and less than 100.');
  });

  it('rejects a free sale price', () => {
    expect(errors('find-original', '0', '20').a).toBe('The price must be greater than 0.');
  });
});

describe('validation', () => {
  it.each(MODES.map(({ id }) => id))('%s requires both values', (mode) => {
    const found = errors(mode, '', '');
    expect(found.a).toMatch(/Please enter/);
    expect(found.b).toMatch(/Please enter/);
  });

  it.each(MODES.map(({ id }) => id))('%s rejects invalid text', (mode) => {
    expect(errors(mode, 'abc', '10').a).toMatch(/valid number/);
    expect(errors(mode, '100', '1,0').b).toMatch(/valid number/);
  });

  it('rejects negative and zero prices', () => {
    expect(errors('percent-off', '-5', '10').a).toBe('The price must be greater than 0.');
    expect(errors('percent-off', '0', '10').a).toBe('The price must be greater than 0.');
    expect(errors('amount-off', '100', '-1').b).toBe("The discount amount can't be negative.");
    expect(errors('find-percent', '100', '-1').b).toBe("The sale price can't be negative.");
  });

  it('rejects percentages out of range', () => {
    expect(errors('percent-off', '100', '101').b).toBe('The discount must be between 0 and 100.');
    expect(errors('percent-off', '100', '-1').b).toBe('The discount must be between 0 and 100.');
  });

  it('rejects amounts that are too large', () => {
    expect(errors('percent-off', '10000000000001', '10').a).toBe('This amount is too large to calculate.');
  });
});

describe('buildResultText', () => {
  it('summarises the discount', () => {
    expect(buildResultText(result('percent-off', '1000', '20'))).toBe(
      'Original price: ₹1,000.00\nDiscount: 20%\nYou save: ₹200.00\nFinal price: ₹800.00',
    );
  });
});
