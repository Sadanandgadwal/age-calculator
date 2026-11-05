import { describe, expect, it } from 'vitest';
import { buildReport, buildResultText, evaluate } from './logic.js';

const words = (count) => 'word '.repeat(count);

describe('Reading Time', () => {
  it('estimates reading and speaking time', () => {
    const { result } = evaluate(words(500), '238', '150');
    expect(result).toMatchObject({ words: 500, readingTime: '2 min 7 sec', speakingTime: '3 min 20 sec' });
    expect(evaluate(words(600), '150', '150').result.readingTime).toBe('4 min');
  });

  it('has no result without words', () => {
    expect(evaluate('', '238', '150').result).toBeNull();
    expect(evaluate('...', '238', '150').result).toBeNull();
  });

  it.each(['', '0', '1001', 'abc'])('rejects a speed of %j', (speed) => {
    const { errors, result } = evaluate(words(5), speed, '150');
    expect(errors.reading).toBeTruthy();
    expect(result).toBeNull();
  });

  it('builds the copied text and report', () => {
    const { result } = evaluate(words(238), '238', '150');
    expect(buildResultText(result)).toContain('Reading time: 1 min at 238 words a minute');
    expect(buildReport(result).results[0]).toEqual({ label: 'Reading time', value: '1 min' });
  });
});
