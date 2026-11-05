import { describe, expect, it } from 'vitest';
import { buildReport, evaluate, generateLorem } from './logic.js';
import { getWords } from '../../utils/textStats.js';

describe('generateLorem', () => {
  it('gives the exact number of words', () => {
    for (const count of [1, 3, 8, 50, 5000]) {
      expect(getWords(generateLorem({ unit: 'words', count, classic: true })), String(count)).toHaveLength(count);
      expect(getWords(generateLorem({ unit: 'words', count, classic: false })), String(count)).toHaveLength(count);
    }
  });

  it('gives the exact number of sentences', () => {
    expect(generateLorem({ unit: 'sentences', count: 5, classic: false }).match(/\./g)).toHaveLength(5);
  });

  it('gives the exact number of paragraphs', () => {
    expect(generateLorem({ unit: 'paragraphs', count: 4, classic: false }).split('\n\n')).toHaveLength(4);
  });

  it('can start with the classic opening, only once', () => {
    const text = generateLorem({ unit: 'paragraphs', count: 3, classic: true });
    expect(text.startsWith('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(true);
    expect(text.match(/Lorem ipsum/g)).toHaveLength(1);
    expect(generateLorem({ unit: 'sentences', count: 2, classic: false })).not.toContain('Lorem ipsum');
    expect(generateLorem({ unit: 'words', count: 2, classic: true })).toBe('Lorem ipsum.');
  });

  it('gives the same text for the same settings', () => {
    const settings = { unit: 'paragraphs', count: 2, classic: false };
    expect(generateLorem(settings)).toBe(generateLorem(settings));
  });
});

describe('evaluate', () => {
  it.each([
    ['paragraphs', '0', 'Please enter 1 to 100.'],
    ['paragraphs', '101', 'Please enter 1 to 100.'],
    ['words', '5001', 'Please enter 1 to 5,000.'],
    ['words', '', 'Please enter 1 to 5,000.'],
    ['sentences', '1.5', 'Please enter a whole number.'],
  ])('%s rejects %j', (unitId, countText, message) => {
    expect(evaluate({ unitId, countText, classic: true }).errors.count).toBe(message);
  });

  it('counts the text and builds the report', () => {
    const { result } = evaluate({ unitId: 'words', countText: '10', classic: false });
    expect(result.words).toBe(10);
    const report = buildReport(result);
    expect(report.inputs[0]).toEqual({ label: 'Words', value: '10' });
    expect(report.text.value).toBe(result.output);
  });
});
