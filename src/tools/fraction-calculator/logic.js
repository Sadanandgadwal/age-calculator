export const MODES = [
  { id: 'calculate', name: 'Two fractions', title: 'Add, subtract, multiply or divide fractions' },
  { id: 'simplify', name: 'Simplify', title: 'Simplify a fraction' },
  { id: 'decimal', name: 'Decimal to fraction', title: 'Turn a decimal into a fraction' },
];

export const OPERATIONS = [
  { id: 'add', name: '+ Add', symbol: '+' },
  { id: 'subtract', name: '− Subtract', symbol: '−' },
  { id: 'multiply', name: '× Multiply', symbol: '×' },
  { id: 'divide', name: '÷ Divide', symbol: '÷' },
];

const MAX_DIGITS = 12;
const decimalFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 6 });

const abs = (value) => (value < 0n ? -value : value);
const gcd = (x, y) => (y === 0n ? abs(x) : gcd(y, x % y));

export function reduce(numerator, denominator) {
  const sign = denominator < 0n ? -1n : 1n;
  const divisor = gcd(numerator, denominator) || 1n;
  return { n: (sign * numerator) / divisor, d: (sign * denominator) / divisor };
}

const tooLong = (...parts) => parts.some((part) => part && part.replace(/^0+/, '').length > MAX_DIGITS);

export function parseFraction(text, { decimals = true } = {}) {
  const value = String(text ?? '').trim().replace(/[−–]/g, '-');
  if (!value) return { error: 'empty' };
  const fraction = value.match(/^(-)?\s*(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const [, minus, whole, top, bottom] = fraction;
    if (tooLong(whole, top, bottom)) return { error: 'long' };
    if (BigInt(bottom) === 0n) return { error: 'zero' };
    const d = BigInt(bottom);
    const n = BigInt(whole ?? 0) * d + BigInt(top);
    return { value: { n: minus ? -n : n, d } };
  }
  const decimal = value.match(/^(-)?(\d*)(?:\.(\d+))?$/);
  if (decimal && (decimal[2] || decimal[3]) && (decimals || !decimal[3])) {
    const [, minus, whole = '', fractional = ''] = decimal;
    if (tooLong(whole, fractional) || fractional.length > MAX_DIGITS) return { error: 'long' };
    const d = 10n ** BigInt(fractional.length);
    const n = BigInt(whole || 0) * d + BigInt(fractional || 0);
    return { value: { n: minus ? -n : n, d } };
  }
  return { error: 'format' };
}

const MESSAGES = {
  empty: (name) => `Please enter ${name}.`,
  long: () => 'Please use numbers with no more than 12 digits.',
  zero: () => "The bottom number of a fraction can't be 0.",
  format: () => 'Please enter a fraction such as 3/4, a mixed number such as 1 1/2, or a whole number.',
};

const field = (text, name, options) => {
  const parsed = parseFraction(text, options);
  return parsed.error ? { error: MESSAGES[parsed.error](name) } : parsed;
};

export function operate(a, b, operation) {
  if (operation === 'add') return reduce(a.n * b.d + b.n * a.d, a.d * b.d);
  if (operation === 'subtract') return reduce(a.n * b.d - b.n * a.d, a.d * b.d);
  if (operation === 'multiply') return reduce(a.n * b.n, a.d * b.d);
  return reduce(a.n * b.d, a.d * b.n);
}

export function formatFraction({ n, d }) {
  return d === 1n ? `${n}` : `${n}/${d}`;
}

export function formatMixed({ n, d }) {
  if (d === 1n || abs(n) < d) return formatFraction({ n, d });
  const whole = abs(n) / d;
  const rest = abs(n) % d;
  return `${n < 0n ? '-' : ''}${whole}${rest ? ` ${rest}/${d}` : ''}`;
}

export function formatDecimalValue({ n, d }) {
  const value = Number(n) / Number(d);
  const shown = decimalFormatter.format(value);
  return Number.isInteger(value * 1e6) || Math.abs(value) >= 1e15 ? shown : `≈ ${shown}`;
}

const text = ({ n, d }) => `${n}/${d}`;

function steps(a, b, operation, answer) {
  let working;
  if (operation === 'add' || operation === 'subtract') {
    const symbol = operation === 'add' ? '+' : '−';
    const common = (a.d * b.d) / gcd(a.d, b.d);
    const left = a.n * (common / a.d);
    const right = b.n * (common / b.d);
    const raw = { n: operation === 'add' ? left + right : left - right, d: common };
    const start = `${text(a)} ${symbol} ${text(b)}`;
    working = a.d === b.d ? `${start} = ${text(raw)}` : `${start} = ${left}/${common} ${symbol} ${right}/${common} = ${text(raw)}`;
    return raw.n === answer.n && raw.d === answer.d ? working : `${working} = ${formatFraction(answer)}`;
  }
  if (operation === 'multiply') working = `${text(a)} × ${text(b)} = ${a.n * b.n}/${a.d * b.d}`;
  else working = `${text(a)} ÷ ${text(b)} = ${text(a)} × ${b.d}/${b.n} = ${a.n * b.d}/${a.d * b.n}`;
  return `${working} = ${formatFraction(answer)}`;
}

export function evaluate(modeId, { a, b, operation }) {
  if (modeId === 'calculate') {
    const first = field(a, 'the first fraction');
    const second = field(b, 'the second fraction');
    const errors = {};
    if (first.error) errors.a = first.error;
    if (second.error) errors.b = second.error;
    if (!errors.b && operation === 'divide' && second.value.n === 0n) errors.b = 'You cannot divide by zero.';
    if (Object.keys(errors).length) return { errors };
    const answer = operate(first.value, second.value, operation);
    return { errors, result: { modeId, answer, working: steps(reduce(first.value.n, first.value.d), reduce(second.value.n, second.value.d), operation, answer) } };
  }
  const input = field(a, modeId === 'decimal' ? 'a decimal' : 'a fraction');
  if (input.error) return { errors: { a: input.error } };
  const answer = reduce(input.value.n, input.value.d);
  const working = modeId === 'decimal' ? `${String(a).trim()} = ${input.value.n}/${input.value.d} = ${formatFraction(answer)}` : `${formatFraction(input.value)} ÷ ${gcd(input.value.n, input.value.d) || 1n} = ${formatFraction(answer)}`;
  return { errors: {}, result: { modeId, answer, working } };
}

export function getRows({ answer, working }) {
  return [
    { label: 'Answer', value: formatFraction(answer) },
    { label: 'Mixed number', value: formatMixed(answer) },
    { label: 'Decimal', value: formatDecimalValue(answer) },
    { label: 'Working', value: working },
  ];
}

export const buildResultText = (result) => getRows(result).map(({ label, value }) => `${label}: ${value}`).join('\n');

export function buildReport(mode, { a, b, operation }, result) {
  const [main, ...rest] = getRows(result);
  const inputs =
    mode.id === 'calculate'
      ? [
          { label: 'First fraction', value: String(a).trim() },
          { label: 'Operation', value: OPERATIONS.find((item) => item.id === operation).name },
          { label: 'Second fraction', value: String(b).trim() },
        ]
      : [{ label: mode.id === 'decimal' ? 'Decimal' : 'Fraction', value: String(a).trim() }];
  return { subtitle: mode.title, inputs, results: [main], details: rest };
}
