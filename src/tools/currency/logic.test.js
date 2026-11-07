import { afterEach, describe, expect, it, vi } from 'vitest';
import { CODES, FETCH_ERROR, NOTE, buildReport, buildResultText, clearRateCache, currencyName, evaluate, fetchRate, formatDate, formatMoney, rateUrl, readRate } from './logic.js';

const live = { rate: 0.0125, date: '2026-11-06' };

afterEach(() => {
  clearRateCache();
  vi.unstubAllGlobals();
});

describe('currencies', () => {
  it('lists unique codes with names', () => {
    expect(new Set(CODES).size).toBe(CODES.length);
    expect(CODES[0]).toBe('INR');
    expect(currencyName('AED')).toBe('United Arab Emirates Dirham');
  });
});

describe('rates', () => {
  it('builds the request and reads the reply', () => {
    expect(rateUrl('INR', 'USD')).toBe('https://api.frankfurter.dev/v2/rates?base=INR&quotes=USD');
    expect(readRate([{ date: '2026-11-06', quote: 'USD', rate: 0.0125 }], 'USD')).toEqual(live);
    expect(() => readRate([{ quote: 'EUR', rate: 1 }], 'USD')).toThrow(FETCH_ERROR);
    expect(() => readRate({ message: 'invalid' }, 'USD')).toThrow(FETCH_ERROR);
  });

  it('fetches once per pair and retries after a failure', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValue({ ok: true, json: async () => [{ date: '2026-11-06', quote: 'USD', rate: 0.0125 }] });
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchRate('INR', 'USD')).rejects.toThrow(FETCH_ERROR);
    expect(await fetchRate('INR', 'USD')).toEqual(live);
    expect(await fetchRate('INR', 'USD')).toEqual(live);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
  });
});

describe('evaluate', () => {
  it('converts with the live rate', () => {
    expect(evaluate({ amount: '1000', manual: '' }, live, 'INR', 'USD').result).toMatchObject({ converted: 12.5, source: 'live', date: '2026-11-06' });
  });

  it('prefers your own rate and handles the same currency', () => {
    expect(evaluate({ amount: '100', manual: '95' }, live, 'USD', 'INR').result).toMatchObject({ converted: 9500, source: 'manual', date: null });
    expect(evaluate({ amount: '5', manual: '' }, null, 'EUR', 'EUR').result).toMatchObject({ converted: 5, source: 'same' });
  });

  it('waits for an amount and a rate', () => {
    expect(evaluate({ amount: '', manual: '' }, live, 'INR', 'USD')).toEqual({ errors: {} });
    expect(evaluate({ amount: '10', manual: '' }, null, 'INR', 'USD')).toEqual({ errors: {} });
  });

  it('checks the values', () => {
    expect(evaluate({ amount: 'x', manual: '0' }, live, 'INR', 'USD').errors).toEqual({ amount: 'Please enter a number, without commas or symbols.', manual: 'Please enter a rate greater than 0.' });
    expect(evaluate({ amount: '-5', manual: '' }, live, 'INR', 'USD').errors.amount).toBe("The amount can't be negative.");
  });
});

describe('formatting and results', () => {
  it('formats money and dates', () => {
    expect(formatMoney(123456.789, 'INR')).toBe('INR 1,23,456.79');
    expect(formatMoney(0.0123, 'USD')).toBe('USD 0.0123');
    expect(formatDate('2026-11-06')).toBe('6 November 2026');
  });

  it('builds the text and report', () => {
    const { result } = evaluate({ amount: '1000', manual: '' }, live, 'INR', 'USD');
    expect(buildResultText(result)).toBe(`INR 1,000.00 = USD 12.50\nExchange rate: 1 INR = 0.0125 USD\nInverse rate: 1 USD = 80 INR\nRate source: Frankfurter, central bank reference rates\nRate date: 6 November 2026\n${NOTE}`);
    const report = buildReport(result);
    expect(report.results).toEqual([{ label: 'Converted amount', value: 'USD 12.50' }]);
    expect(report.inputs[1]).toEqual({ label: 'From', value: 'Indian Rupee (INR)' });
  });
});
