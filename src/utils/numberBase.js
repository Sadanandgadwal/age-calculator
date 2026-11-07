const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const PREFIXES = { 2: '0b', 8: '0o', 16: '0x' };
export const MAX_DIGITS = 1000;

export const BASE_NAMES = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' };
export const baseName = (base) => BASE_NAMES[base] ?? `Base ${base}`;

export function parseInBase(text, base) {
  let value = String(text ?? '').trim().toLowerCase().replace(/[\s_,]/g, '');
  if (!value) return { error: 'empty' };
  const negative = value.startsWith('-');
  if (negative) value = value.slice(1);
  if (PREFIXES[base] && value.startsWith(PREFIXES[base])) value = value.slice(2);
  if (!value) return { error: 'empty' };
  if (value.length > MAX_DIGITS) return { error: 'long' };
  const bigBase = BigInt(base);
  let result = 0n;
  for (const character of value) {
    const digit = DIGITS.indexOf(character);
    if (digit < 0 || digit >= base) return { error: 'digit', character };
    result = result * bigBase + BigInt(digit);
  }
  return { value: negative ? -result : result };
}

export function formatInBase(value, base, { upper = true } = {}) {
  const text = value.toString(base);
  return upper ? text.toUpperCase() : text;
}

export function groupDigits(text, size) {
  const negative = text.startsWith('-');
  const digits = negative ? text.slice(1) : text;
  const groups = [];
  for (let end = digits.length; end > 0; end -= size) groups.unshift(digits.slice(Math.max(0, end - size), end));
  return `${negative ? '-' : ''}${groups.join(' ')}`;
}

export function describeParseError(error, base, character) {
  if (error === 'empty') return 'Please enter a number.';
  if (error === 'long') return `Please enter no more than ${MAX_DIGITS} digits.`;
  const allowed = base <= 10 ? `0 to ${base - 1}` : `0 to 9 and A to ${DIGITS[base - 1].toUpperCase()}`;
  return `"${character.toUpperCase()}" is not a ${baseName(base).toLowerCase()} digit. Use ${allowed}.`;
}

const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const superscript = (number) => String(number).split('').map((digit) => SUPERSCRIPTS[digit]).join('');

export function placeValueWorking(value, base, maxDigits = 16) {
  const digits = formatInBase(value < 0n ? -value : value, base);
  if (digits.length > maxDigits) return null;
  const parts = [...digits].map((digit, index) => ({ digit: DIGITS.indexOf(digit.toLowerCase()), power: digits.length - 1 - index }));
  const terms = parts.map(({ digit, power }) => `${digit} × ${base}${superscript(power)}`).join(' + ');
  const values = parts.map(({ digit, power }) => (BigInt(digit) * BigInt(base) ** BigInt(power)).toString()).join(' + ');
  return `${terms} = ${values} = ${(value < 0n ? -value : value).toString()}`;
}

export function divisionSteps(value, base, maxSteps = 64) {
  let current = value < 0n ? -value : value;
  const steps = [];
  const bigBase = BigInt(base);
  if (current === 0n) return [{ dividend: '0', quotient: '0', remainder: '0' }];
  while (current > 0n) {
    if (steps.length >= maxSteps) return null;
    const quotient = current / bigBase;
    const remainder = current % bigBase;
    steps.push({ dividend: current.toString(), quotient: quotient.toString(), remainder: formatInBase(remainder, base) });
    current = quotient;
  }
  return steps;
}
