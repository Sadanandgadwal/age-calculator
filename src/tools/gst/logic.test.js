import { describe, expect, it } from 'vitest';
import { CURRENT_RATES, CUSTOM_RATE, OLDER_RATES, buildResultText, calculateGst, evaluate, formatInr, formatRate, getBreakdown } from './logic.js';

const add = (amount, rate, transaction = 'intra') => calculateGst({ amount, rate, direction: 'add', transaction });
const remove = (amount, rate, transaction = 'intra') => calculateGst({ amount, rate, direction: 'remove', transaction });
const run = (overrides) => evaluate({ amount: '1000', rateChoice: '18', customRate: '', direction: 'add', transaction: 'intra', ...overrides });

describe('adding GST', () => {
  it('matches the intra-state example', () => {
    expect(add(1000, 18)).toMatchObject({ taxable: 100000, gst: 18000, cgst: 9000, sgst: 9000, igst: 0, final: 118000 });
  });

  it('matches the inter-state example', () => {
    expect(add(1000, 18, 'inter')).toMatchObject({ taxable: 100000, gst: 18000, cgst: 0, sgst: 0, igst: 18000, final: 118000 });
  });

  it.each([
    ['0', 0, 100000],
    ['0.25', 250, 100250],
    ['3', 3000, 103000],
    ['5', 5000, 105000],
    ['12', 12000, 112000],
    ['18', 18000, 118000],
    ['28', 28000, 128000],
    ['40', 40000, 140000],
  ])('calculates %s%% on ₹1,000', (rate, gst, final) => {
    const result = add(1000, Number(rate));
    expect(result.gst).toBe(gst);
    expect(result.final).toBe(final);
  });

  it('offers every required rate', () => {
    expect([...CURRENT_RATES, ...OLDER_RATES].sort()).toEqual(['0', '0.25', '12', '18', '28', '3', '40', '5'].sort());
  });

  it('handles decimal amounts', () => {
    expect(add(99.99, 18)).toMatchObject({ original: 9999, gst: 1800, final: 11799 });
    expect(add(0.1, 18).gst).toBe(2);
    expect(add(1234.56, 12.5)).toMatchObject({ gst: 15432, final: 138888 });
  });

  it('avoids floating point errors in paise', () => {
    expect(add(1.1, 0).original).toBe(110);
    expect(add(19.99, 0).original).toBe(1999);
    expect(add(1.15, 100).final).toBe(230);
  });
});

describe('removing GST', () => {
  it('finds the taxable value of an inclusive amount', () => {
    expect(remove(1180, 18)).toMatchObject({ original: 118000, taxable: 100000, gst: 18000, cgst: 9000, sgst: 9000, final: 118000 });
  });

  it('uses IGST for inter-state', () => {
    expect(remove(1180, 18, 'inter')).toMatchObject({ taxable: 100000, igst: 18000, cgst: 0, sgst: 0 });
  });

  it('does not take the rate as a percentage of the inclusive amount', () => {
    expect(remove(1180, 18).gst).not.toBe(21240);
  });

  it('always adds back to the entered amount', () => {
    for (const rate of [0, 0.25, 3, 5, 12, 18, 28, 40, 7.5]) {
      for (const amount of [1, 99.99, 1000, 1234.56]) {
        const result = remove(amount, rate);
        expect(result.taxable + result.gst, `${amount} at ${rate}`).toBe(result.original);
        expect(result.final).toBe(result.original);
      }
    }
  });

  it('changes nothing at 0%', () => {
    expect(remove(1000, 0)).toMatchObject({ taxable: 100000, gst: 0 });
  });

  it('reverses adding GST', () => {
    expect(remove(add(1000, 5).final / 100, 5).taxable).toBe(100000);
  });
});

describe('CGST and SGST', () => {
  it('always add up to the total GST, including odd paise', () => {
    const odd = add(0.05, 18);
    expect(odd.gst).toBe(1);
    expect(odd.cgst + odd.sgst).toBe(1);
    expect(odd.cgst).toBe(1);
    expect(odd.sgst).toBe(0);

    const result = add(10.5, 18);
    expect(result.cgst + result.sgst).toBe(result.gst);
    expect(Math.abs(result.cgst - result.sgst)).toBeLessThanOrEqual(1);
  });
});

describe('evaluate', () => {
  it('uses a selected rate', () => {
    expect(run({ rateChoice: '5' }).result.gst).toBe(5000);
  });

  it('uses a custom rate, including decimals', () => {
    expect(run({ rateChoice: CUSTOM_RATE, customRate: '7.5' }).result.gst).toBe(7500);
    expect(run({ rateChoice: CUSTOM_RATE, customRate: '0' }).result.gst).toBe(0);
    expect(run({ rateChoice: CUSTOM_RATE, customRate: '100' }).result.gst).toBe(100000);
  });

  it('ignores the custom field unless it is chosen', () => {
    expect(run({ customRate: 'abc' }).errors).toEqual({});
  });

  it('accepts zero', () => {
    expect(run({ amount: '0' }).result.final).toBe(0);
  });

  it.each([
    ['', 'Please enter an amount.'],
    ['  ', 'Please enter an amount.'],
    ['abc', 'Please enter a valid number, without commas or symbols.'],
    ['1,000', 'Please enter a valid number, without commas or symbols.'],
    ['₹100', 'Please enter a valid number, without commas or symbols.'],
    ['-1', "The amount can't be negative."],
    ['10000000000001', 'This amount is too large to calculate.'],
  ])('rejects the amount %j', (amount, message) => {
    const { errors, result } = run({ amount });
    expect(errors.amount).toBe(message);
    expect(result).toBeUndefined();
  });

  it.each([
    ['', 'Please enter a GST rate.'],
    ['abc', 'Please enter a valid number.'],
    ['-1', 'The GST rate must be between 0 and 100.'],
    ['101', 'The GST rate must be between 0 and 100.'],
  ])('rejects the custom rate %j', (customRate, message) => {
    expect(run({ rateChoice: CUSTOM_RATE, customRate }).errors.customRate).toBe(message);
  });
});

describe('formatting', () => {
  it('uses INR with Indian grouping', () => {
    expect(formatInr(118000)).toBe('₹1,180.00');
    expect(formatInr(12345678900)).toBe('₹12,34,56,789.00');
    expect(formatInr(5)).toBe('₹0.05');
  });

  it('formats rates', () => {
    expect(formatRate(18)).toBe('18%');
    expect(formatRate(0.25)).toBe('0.25%');
    expect(formatRate(0.125)).toBe('0.125%');
  });

  it('lists the whole breakdown', () => {
    expect(getBreakdown(add(1000, 18))).toEqual([
      { label: 'Original Amount', value: '₹1,000.00' },
      { label: 'Taxable Amount', value: '₹1,000.00' },
      { label: 'GST Percentage', value: '18%' },
      { label: 'CGST (9%)', value: '₹90.00' },
      { label: 'SGST (9%)', value: '₹90.00' },
      { label: 'IGST (18%)', value: 'Not applicable' },
      { label: 'Total GST', value: '₹180.00' },
      { label: 'Final Amount', value: '₹1,180.00' },
    ]);
  });

  it('marks CGST and SGST as not applicable for inter-state', () => {
    const breakdown = getBreakdown(add(1000, 18, 'inter'));
    expect(breakdown[3].value).toBe('Not applicable');
    expect(breakdown[4].value).toBe('Not applicable');
    expect(breakdown[5].value).toBe('₹180.00');
  });

  it('builds copied text', () => {
    const text = buildResultText(add(1000, 18));
    expect(text).toContain('CGST (9%): ₹90.00');
    expect(text).toContain('Final Amount: ₹1,180.00');
  });
});
