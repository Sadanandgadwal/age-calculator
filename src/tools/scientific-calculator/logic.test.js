import { describe, expect, it } from 'vitest';
import { MESSAGES, buildReport, buildResultText, calculate, formatNumber, tokenize } from './logic.js';

const value = (text, options) => calculate(text, options).value;
const error = (text, options) => calculate(text, options).error;
const shown = (text, options) => formatNumber(value(text, options));

describe('arithmetic', () => {
  it('follows the order of operations', () => {
    expect(value('2+3×4')).toBe(14);
    expect(value('(2+3)*4')).toBe(20);
    expect(value('10−4÷2')).toBe(8);
    expect(value('2^3^2')).toBe(512);
    expect(value('-2^2')).toBe(-4);
    expect(value('2^-2')).toBe(0.25);
  });

  it('accepts implied multiplication', () => {
    expect(shown('2π')).toBe('6.28318530718');
    expect(value('2(3+4)')).toBe(14);
    expect(value('(2)(3)')).toBe(6);
  });

  it('handles factorials, percentages and scientific notation', () => {
    expect(value('5!')).toBe(120);
    expect(value('3!!')).toBe(720);
    expect(value('50%')).toBe(0.5);
    expect(value('1e3')).toBe(1000);
    expect(value('2.5e-3')).toBe(0.0025);
  });

  it('hides floating point noise', () => {
    expect(shown('0.1+0.2')).toBe('0.3');
    expect(shown('1/3')).toBe('0.333333333333');
  });

  it('closes brackets left open at the end', () => {
    expect(value('√(16+9')).toBe(5);
  });

  it('reuses the previous answer', () => {
    expect(value('ans×2', { ans: 7 })).toBe(14);
    expect(value('Ans')).toBe(0);
  });
});

describe('functions', () => {
  it('works in degrees', () => {
    expect(value('sin(30)')).toBe(0.5);
    expect(value('sin30')).toBe(0.5);
    expect(value('cos(90)')).toBe(0);
    expect(value('sin(180)')).toBe(0);
    expect(shown('tan(45)')).toBe('1');
    expect(shown('asin(0.5)')).toBe('30');
    expect(shown('atan(1)')).toBe('45');
  });

  it('works in radians', () => {
    expect(value('sin(π/2)', { angle: 'rad' })).toBe(1);
    expect(shown('acos(0)', { angle: 'rad' })).toBe('1.57079632679');
  });

  it('works out roots, logs and others', () => {
    expect(value('√16')).toBe(4);
    expect(value('sqrt(2)^2')).toBeCloseTo(2);
    expect(value('cbrt(-27)')).toBe(-3);
    expect(value('log(1000)')).toBe(3);
    expect(value('ln(e)')).toBe(1);
    expect(value('abs(-4)')).toBe(4);
    expect(shown('exp(1)')).toBe('2.71828182846');
  });
});

describe('errors', () => {
  it.each([
    ['', MESSAGES.empty],
    ['2+', MESSAGES.incomplete],
    ['()', MESSAGES.incomplete],
    ['2+3)', MESSAGES.brackets],
    ['10/0', MESSAGES.divide],
    ['0^-1', MESSAGES.divide],
    ['sqrt(-1)', MESSAGES.domain],
    ['log(0)', MESSAGES.domain],
    ['asin(2)', MESSAGES.domain],
    ['(-8)^(1/3)', MESSAGES.domain],
    ['171!', MESSAGES.factorial],
    ['4.5!', MESSAGES.factorial],
    ['tan(90)', MESSAGES.tan],
    ['tan(-270)', MESSAGES.tan],
    ['10^400', MESSAGES.large],
    ['1+'.repeat(300), MESSAGES.long],
  ])('%s', (text, message) => {
    expect(error(text)).toBe(message);
  });

  it('names text it does not understand', () => {
    expect(error('2+abc')).toBe('"abc" is not something this calculator understands.');
    expect(error('2#3')).toBe('"#" is not something this calculator understands.');
  });
});

describe('tokenize', () => {
  it('splits joined names', () => {
    expect(tokenize('2sinpi').map(({ value: item }) => item)).toEqual([2, 'sin', 'pi']);
    expect(tokenize('exp(1)')[0]).toEqual({ type: 'function', value: 'exp' });
  });
});

describe('formatNumber', () => {
  it('uses powers of ten for very large and small answers', () => {
    expect(formatNumber(2 ** 100)).toBe('1.2676506 × 10^30');
    expect(formatNumber(1e-7)).toBe('1 × 10^-7');
    expect(formatNumber(123456)).toBe('123456');
    expect(formatNumber(-0.5)).toBe('-0.5');
  });
});

describe('results', () => {
  it('builds the text and report', () => {
    const answer = { expression: ' 2+3 ', angle: 'deg', value: 5 };
    expect(buildResultText(answer)).toBe('2+3 = 5');
    const report = buildReport(answer, [{ expression: '2+3', value: 5 }, { expression: '1+1', value: 2 }]);
    expect(report.inputs).toEqual([{ label: 'Calculation', value: '2+3' }, { label: 'Angle mode', value: 'Degrees' }]);
    expect(report.results).toEqual([{ label: 'Answer', value: '5' }]);
    expect(report.details).toEqual([{ label: 'Earlier 1', value: '1+1 = 2' }]);
  });
});
