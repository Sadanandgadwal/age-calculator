import { describe, expect, it } from 'vitest';
import { calculateAge } from './age.js';
import { buildResultText, formatCountdown, pluralize } from './formatResult.js';

describe('pluralize', () => {
  it('handles singular, plural, zero and thousands', () => {
    expect(pluralize(1, 'day')).toBe('1 day');
    expect(pluralize(2, 'day')).toBe('2 days');
    expect(pluralize(0, 'day')).toBe('0 days');
    expect(pluralize(10368, 'day')).toBe('10,368 days');
  });
});

describe('formatCountdown', () => {
  it('shows Today on a birthday, otherwise the days left', () => {
    expect(formatCountdown({ isToday: true, daysUntil: 0 })).toBe('Today!');
    expect(formatCountdown({ isToday: false, daysUntil: 1 })).toBe('1 day');
  });
});

describe('buildResultText', () => {
  it('summarises the result', () => {
    expect(buildResultText(calculateAge('1998-06-15', '2026-11-03'))).toBe(
      [
        'Age on 3 Nov 2026: 28 years, 4 months, 19 days',
        'Born on: Monday, 15 Jun 1998',
        'Total lived: 10,368 days, 1,481 weeks, 340 months',
        'Next birthday: 15 Jun 2027 (224 days)',
      ].join('\n'),
    );
  });
});
