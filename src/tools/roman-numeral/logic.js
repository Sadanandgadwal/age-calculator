const SYMBOLS = [
  ['M', 1000],
  ['CM', 900],
  ['D', 500],
  ['CD', 400],
  ['C', 100],
  ['XC', 90],
  ['L', 50],
  ['XL', 40],
  ['X', 10],
  ['IX', 9],
  ['V', 5],
  ['IV', 4],
  ['I', 1],
];
const VALID = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export function toParts(number) {
  const parts = [];
  let rest = number;
  for (const [symbol, value] of SYMBOLS) {
    while (rest >= value) {
      parts.push([symbol, value]);
      rest -= value;
    }
  }
  return parts;
}

export const toRoman = (number) => toParts(number).map(([symbol]) => symbol).join('');

export function fromRoman(text) {
  const parts = [];
  let index = 0;
  while (index < text.length) {
    const pair = SYMBOLS.find(([symbol]) => text.startsWith(symbol, index));
    parts.push(pair);
    index += pair[0].length;
  }
  return parts;
}

export function convert(input) {
  const text = String(input ?? '').trim().replace(/\s+/g, '').toUpperCase();
  if (!text) return {};
  if (/^\d+$/.test(text)) {
    const number = Number(text);
    if (number < 1 || number > 3999) return { error: 'Roman numerals here cover 1 to 3,999. Please enter a number in that range.' };
    const parts = toParts(number);
    return { result: { direction: 'to-roman', number, roman: toRoman(number), parts } };
  }
  if (/[^IVXLCDM]/.test(text)) return { error: 'Please enter a whole number such as 2026, or a Roman numeral using I, V, X, L, C, D and M.' };
  if (!VALID.test(text)) {
    const suggestion = fromLoose(text);
    return { error: `${text} is not a correctly written Roman numeral.${suggestion ? ` Did you mean ${toRoman(suggestion)} (${suggestion})?` : ''}` };
  }
  const parts = fromRoman(text);
  const number = parts.reduce((total, [, value]) => total + value, 0);
  return { result: { direction: 'to-number', number, roman: text, parts } };
}

function fromLoose(text) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    const value = values[text[index]];
    const next = values[text[index + 1]] ?? 0;
    total += value < next ? -value : value;
  }
  return total >= 1 && total <= 3999 ? total : null;
}

export const breakdown = (parts) => parts.map(([symbol, value]) => `${symbol} = ${value.toLocaleString('en-IN')}`).join(', ');
export const sum = (parts) => `${parts.map(([, value]) => value).join(' + ')} = ${parts.reduce((total, [, value]) => total + value, 0)}`;

export function buildResultText(result) {
  const answer = result.direction === 'to-roman' ? `${result.number} = ${result.roman}` : `${result.roman} = ${result.number}`;
  return [answer, `Parts: ${breakdown(result.parts)}`, `Sum: ${sum(result.parts)}`].join('\n');
}

export function buildReport(result) {
  const isRoman = result.direction === 'to-roman';
  return {
    inputs: [{ label: isRoman ? 'Number' : 'Roman numeral', value: isRoman ? String(result.number) : result.roman }],
    results: [{ label: isRoman ? 'Roman numeral' : 'Number', value: isRoman ? result.roman : String(result.number) }],
    details: [
      { label: 'Parts', value: breakdown(result.parts) },
      { label: 'Sum', value: sum(result.parts) },
    ],
  };
}
