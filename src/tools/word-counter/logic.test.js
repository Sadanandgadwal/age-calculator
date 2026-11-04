import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate } from './logic.js';

describe('Word Counter', () => {
  it('has no result for blank text', () => {
    expect(evaluate('')).toBeNull();
    expect(evaluate('  \n ')).toBeNull();
  });

  it('counts the text and estimates the time', () => {
    const result = evaluate('Back at 5. Call me!');
    expect(result).toMatchObject({ words: 5, characters: 19, sentences: 2, charactersNoSpaces: 15, paragraphs: 1 });
    expect(evaluate('word '.repeat(1000)).readingTime).toBe('4 min 13 sec');
    expect(evaluate('word '.repeat(1000)).speakingTime).toBe('6 min 40 sec');
  });

  it('builds the copied text and print report', () => {
    const result = evaluate('One two.');
    expect(buildResultText(result)).toContain('Words: 2');
    const report = buildReport('One two.', result);
    expect(report.results[0]).toEqual({ label: 'Words', value: '2' });
    expect(report.text.value).toBe('One two.');
  });
});
