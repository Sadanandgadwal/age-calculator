const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;
const decimalFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function parseDecimal(text) {
  const trimmed = String(text ?? '').trim();
  if (!NUMBER_PATTERN.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export const formatDecimal = (value) => decimalFormatter.format(value);

export const roundTo2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const ceilTo2 = (value) => Math.ceil(Number((value * 100).toFixed(6))) / 100;
