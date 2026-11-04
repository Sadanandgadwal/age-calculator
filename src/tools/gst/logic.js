import { parseDecimal } from '../../utils/number.js';

export const CURRENT_RATES = ['0', '0.25', '3', '5', '18', '40'];
export const OLDER_RATES = ['12', '28'];
export const CUSTOM_RATE = 'custom';
export const DEFAULT_RATE = '18';

const MAX_AMOUNT = 1e13;
const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const percentFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 });

export const formatInr = (paise) => inrFormatter.format(paise / 100);
export const formatRate = (rate) => `${percentFormatter.format(rate)}%`;

const toPaise = (value) => Math.round(Number((value * 100).toFixed(4)));
const roundPaise = (value) => Math.round(Number(value.toFixed(6)));

export function calculateGst({ amount, rate, direction, transaction }) {
  const amountPaise = toPaise(amount);
  const isAdding = direction === 'add';
  const taxable = isAdding ? amountPaise : roundPaise((amountPaise * 100) / (100 + rate));
  const gst = isAdding ? roundPaise((amountPaise * rate) / 100) : amountPaise - taxable;
  const isIntraState = transaction === 'intra';
  const cgst = isIntraState ? Math.ceil(gst / 2) : 0;

  return {
    direction,
    transaction,
    rate,
    original: amountPaise,
    taxable,
    gst,
    cgst,
    sgst: isIntraState ? gst - cgst : 0,
    igst: isIntraState ? 0 : gst,
    final: taxable + gst,
  };
}

function rateFrom(rateChoice, customRate) {
  if (rateChoice !== CUSTOM_RATE) return { rate: Number(rateChoice) };
  if (!String(customRate ?? '').trim()) return { error: 'Please enter a GST rate.' };
  const rate = parseDecimal(customRate);
  if (rate === null) return { error: 'Please enter a valid number.' };
  if (rate < 0 || rate > 100) return { error: 'The GST rate must be between 0 and 100.' };
  return { rate };
}

export function evaluate({ amount, rateChoice, customRate, direction, transaction }) {
  const errors = {};
  const value = parseDecimal(amount);

  if (!String(amount ?? '').trim()) errors.amount = 'Please enter an amount.';
  else if (value === null) errors.amount = 'Please enter a valid number, without commas or symbols.';
  else if (value < 0) errors.amount = "The amount can't be negative.";
  else if (value > MAX_AMOUNT) errors.amount = 'This amount is too large to calculate.';

  const { rate, error: rateError } = rateFrom(rateChoice, customRate);
  if (rateError) errors.customRate = rateError;

  if (Object.keys(errors).length > 0) return { errors };
  return { errors, result: calculateGst({ amount: value, rate, direction, transaction }) };
}

export function getBreakdown(result) {
  const halfRate = formatRate(result.rate / 2);
  return [
    { label: 'Original Amount', value: formatInr(result.original) },
    { label: 'Taxable Amount', value: formatInr(result.taxable) },
    { label: 'GST Percentage', value: formatRate(result.rate) },
    { label: `CGST (${halfRate})`, value: result.transaction === 'intra' ? formatInr(result.cgst) : 'Not applicable' },
    { label: `SGST (${halfRate})`, value: result.transaction === 'intra' ? formatInr(result.sgst) : 'Not applicable' },
    { label: `IGST (${formatRate(result.rate)})`, value: result.transaction === 'inter' ? formatInr(result.igst) : 'Not applicable' },
    { label: 'Total GST', value: formatInr(result.gst) },
    { label: 'Final Amount', value: formatInr(result.final) },
  ];
}

export const buildResultText = (result) =>
  getBreakdown(result)
    .map(({ label, value }) => `${label}: ${value}`)
    .join('\n');
