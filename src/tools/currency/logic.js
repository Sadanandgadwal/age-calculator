import { parseDecimal } from '../../utils/number.js';

export const CODES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR', 'KWD', 'OMR', 'BHD', 'SGD', 'AUD', 'CAD', 'NZD', 'JPY', 'CNY', 'HKD', 'CHF', 'MYR', 'THB', 'IDR', 'PHP', 'KRW', 'VND', 'LKR', 'NPR', 'BDT', 'PKR', 'ZAR', 'EGP', 'ILS', 'TRY', 'RUB', 'BRL', 'MXN', 'SEK', 'NOK', 'DKK', 'PLN'];

const names = new Intl.DisplayNames(['en'], { type: 'currency' });
export const currencyName = (code) => names.of(code) ?? code;

export const API = 'https://api.frankfurter.dev/v2/rates';
export const rateUrl = (from, to) => `${API}?base=${from}&quotes=${to}`;

export const FETCH_ERROR = 'The exchange rate could not be loaded. Check your connection and try again, or enter a rate yourself.';

export function readRate(data, to) {
  const entry = Array.isArray(data) ? data.find((item) => item?.quote === to) : null;
  const rate = Number(entry?.rate);
  if (!entry || !Number.isFinite(rate) || rate <= 0) throw new Error(FETCH_ERROR);
  return { rate, date: String(entry.date ?? '') };
}

const cache = new Map();

export async function fetchRate(from, to, signal) {
  const key = `${from}-${to}`;
  if (!cache.has(key)) {
    const request = fetch(rateUrl(from, to), { signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then((response) => {
        if (!response.ok) throw new Error(FETCH_ERROR);
        return response.json();
      })
      .then((data) => readRate(data, to));
    cache.set(key, request);
    request.catch(() => cache.delete(key));
  }
  return cache.get(key);
}

export const clearRateCache = () => cache.clear();

export function formatMoney(value, code) {
  const digits = Math.abs(value) >= 1 || value === 0 ? 2 : 6;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, currencyDisplay: 'code', maximumFractionDigits: digits }).format(value).replace(/\u00a0/g, ' ');
}

export const formatRate = (rate) => Number(rate.toPrecision(6)).toLocaleString('en-IN', { maximumFractionDigits: 6 });

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (date) => (/^\d{4}-\d{2}-\d{2}$/.test(date) ? dateFormatter.format(new Date(`${date}T00:00:00Z`)) : date);

export function evaluate({ amount, manual }, live, from, to) {
  const errors = {};
  let value = null;
  if (String(amount ?? '').trim()) {
    value = parseDecimal(amount);
    if (value === null) errors.amount = 'Please enter a number, without commas or symbols.';
    else if (value < 0) errors.amount = "The amount can't be negative.";
    else if (value > 1e13) errors.amount = 'This amount is too large to convert.';
  }
  let rate = null;
  let source = null;
  if (String(manual ?? '').trim()) {
    const manualRate = parseDecimal(manual);
    if (manualRate === null || manualRate <= 0) errors.manual = 'Please enter a rate greater than 0.';
    else {
      rate = manualRate;
      source = 'manual';
    }
  } else if (from === to) {
    rate = 1;
    source = 'same';
  } else if (live?.rate) {
    rate = live.rate;
    source = 'live';
  }
  if (Object.keys(errors).length || value === null || rate === null) return { errors };
  return { errors, result: { amount: value, from, to, rate, source, date: source === 'live' ? live.date : null, converted: value * rate } };
}

export function getRows(result) {
  return [
    { label: 'Exchange rate', value: `1 ${result.from} = ${formatRate(result.rate)} ${result.to}` },
    { label: 'Inverse rate', value: `1 ${result.to} = ${formatRate(1 / result.rate)} ${result.from}` },
    { label: 'Rate source', value: { live: 'Frankfurter, central bank reference rates', manual: 'Rate you entered', same: 'Same currency' }[result.source] },
    ...(result.date ? [{ label: 'Rate date', value: formatDate(result.date) }] : []),
  ];
}

export const summary = (result) => `${formatMoney(result.amount, result.from)} = ${formatMoney(result.converted, result.to)}`;

export const NOTE = 'Reference rates are for information only. Banks and money changers add their own margin, so the rate you get will differ.';

export const buildResultText = (result) => [summary(result), ...getRows(result).map(({ label, value }) => `${label}: ${value}`), NOTE].join('\n');

export function buildReport(result) {
  return {
    inputs: [
      { label: 'Amount', value: formatMoney(result.amount, result.from) },
      { label: 'From', value: `${currencyName(result.from)} (${result.from})` },
      { label: 'To', value: `${currencyName(result.to)} (${result.to})` },
    ],
    results: [{ label: 'Converted amount', value: formatMoney(result.converted, result.to) }],
    details: getRows(result),
    notes: [NOTE],
  };
}
