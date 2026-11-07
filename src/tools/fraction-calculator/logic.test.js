import { describe, expect, it } from 'vitest';
import { MODES, buildReport, buildResultText, evaluate, formatDecimalValue, formatMixed, parseFraction, reduce } from './logic.js';

const result = (mode, values) => evaluate(mode, values).result;
const errors = (mode, values) => evaluate(mode, values).errors;
const answer = (mode, values) => getAnswer(result(mode, values));
const getAnswer = ({ answer: value }) => `${value.n}/${value.d}`;

describe('parseFraction', () => {
  it('reads fractions, mixed numbers, whole numbers and decimals', () => {
    expect(parseFraction('3/4').value).toEqual({ n: 3n, d: 4n });
    expect(parseFraction(' 1 1/2 ').value).toEqual({ n: 3n, d: 2n });
    expect(parseFraction('-2 3/4').value).toEqual({ n: -11n, d: 4n });
    expect(parseFraction('5').value).toEqual({ n: 5n, d: 1n });
    expect(parseFraction('0.25').value).toEqual({ n: 25n, d: 100n });
    expect(parseFraction('−1/2').value).toEqual({ n: -1n, d: 2n });
  });

  it('names the problem', () => {
    expect(parseFraction('').error).toBe('empty');
    expect(parseFraction('1/0').error).toBe('zero');
    expect(parseFraction('1/2/3').error).toBe('format');
    expect(parseFraction('1234567890123/2').error).toBe('long');
  });
});

describe('reduce', () => {
  it('simplifies and moves the sign to the top', () => {
    expect(reduce(12n, 16n)).toEqual({ n: 3n, d: 4n });
    expect(reduce(6n, -4n)).toEqual({ n: -3n, d: 2n });
    expect(reduce(0n, 5n)).toEqual({ n: 0n, d: 1n });
  });
});

describe('calculate', () => {
  it.each([
    ['1/2', '1/3', 'add', '5/6'],
    ['1/6', '1/4', 'subtract', '-1/12'],
    ['1 1/2', '2/3', 'multiply', '1/1'],
    ['3/4', '1/2', 'divide', '3/2'],
    ['5', '0.5', 'divide', '10/1'],
    ['3/4', '-1/2', 'divide', '-3/2'],
  ])('%s and %s (%s)', (a, b, operation, expected) => {
    expect(answer('calculate', { a, b, operation })).toBe(expected);
  });

  it('shows the working', () => {
    expect(result('calculate', { a: '1/2', b: '1/3', operation: 'add' }).working).toBe('1/2 + 1/3 = 3/6 + 2/6 = 5/6');
    expect(result('calculate', { a: '1/4', b: '1/4', operation: 'add' }).working).toBe('1/4 + 1/4 = 2/4 = 1/2');
    expect(result('calculate', { a: '3/4', b: '1/2', operation: 'divide' }).working).toBe('3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2');
  });

  it('refuses to divide by zero', () => {
    expect(errors('calculate', { a: '1/2', b: '0', operation: 'divide' }).b).toBe('You cannot divide by zero.');
    expect(result('calculate', { a: '1/2', b: '0', operation: 'multiply' }).answer).toEqual({ n: 0n, d: 1n });
  });

  it('reports both missing fractions', () => {
    expect(errors('calculate', { a: '', b: '', operation: 'add' })).toEqual({ a: 'Please enter the first fraction.', b: 'Please enter the second fraction.' });
  });
});

describe('other modes', () => {
  it('simplifies a fraction', () => {
    expect(result('simplify', { a: '12/16' })).toMatchObject({ answer: { n: 3n, d: 4n }, working: '12/16 ÷ 4 = 3/4' });
  });

  it('turns a decimal into a fraction', () => {
    expect(result('decimal', { a: '0.375' })).toMatchObject({ answer: { n: 3n, d: 8n }, working: '0.375 = 375/1000 = 3/8' });
    expect(errors('decimal', { a: 'x' }).a).toMatch(/^Please enter a fraction such as 3\/4/);
    expect(errors('decimal', { a: '' }).a).toBe('Please enter a decimal.');
  });
});

describe('formats', () => {
  it('writes mixed numbers and decimals', () => {
    expect(formatMixed({ n: -11n, d: 4n })).toBe('-2 3/4');
    expect(formatMixed({ n: 8n, d: 4n })).toBe('2');
    expect(formatDecimalValue({ n: 3n, d: 8n })).toBe('0.375');
    expect(formatDecimalValue({ n: 1n, d: 3n })).toBe('≈ 0.333333');
  });

  it('builds the text and report', () => {
    const sum = result('calculate', { a: '1/2', b: '1/3', operation: 'add' });
    expect(buildResultText(sum)).toBe('Answer: 5/6\nMixed number: 5/6\nDecimal: ≈ 0.833333\nWorking: 1/2 + 1/3 = 3/6 + 2/6 = 5/6');
    const report = buildReport(MODES[0], { a: '1/2', b: '1/3', operation: 'add' }, sum);
    expect(report.inputs).toEqual([
      { label: 'First fraction', value: '1/2' },
      { label: 'Operation', value: '+ Add' },
      { label: 'Second fraction', value: '1/3' },
    ]);
    expect(report.results).toEqual([{ label: 'Answer', value: '5/6' }]);
  });
});
