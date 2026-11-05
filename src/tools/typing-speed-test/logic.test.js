import { describe, expect, it } from 'vitest';
import { PASSAGES, buildReport, buildResultText, buildSegments, compareTyping, isFinished, scoreTyping } from './logic.js';

describe('passages', () => {
  it('are long enough for very fast typists', () => {
    for (const passage of PASSAGES) expect(passage.length).toBeGreaterThan(2400);
  });

  it('differ from each other', () => {
    expect(new Set(PASSAGES).size).toBe(PASSAGES.length);
  });
});

describe('compareTyping', () => {
  it('counts correct characters and errors by position', () => {
    expect(compareTyping('hello', 'hxllo')).toEqual({ typed: 5, correct: 4, errors: 1 });
    expect(compareTyping('hello', 'he')).toEqual({ typed: 2, correct: 2, errors: 0 });
    expect(compareTyping('hi', 'hi there')).toEqual({ typed: 8, correct: 2, errors: 6 });
    expect(compareTyping('abc', '')).toEqual({ typed: 0, correct: 0, errors: 0 });
  });
});

describe('scoreTyping', () => {
  const passage = 'x'.repeat(2000);

  it('uses five characters as a word', () => {
    expect(scoreTyping(passage, 'x'.repeat(300), 60000).wpm).toBe(60);
    expect(scoreTyping(passage, 'x'.repeat(200), 30000).wpm).toBe(80);
  });

  it('separates net and raw speed, and works out accuracy', () => {
    const score = scoreTyping(passage, `${'x'.repeat(190)}${'y'.repeat(10)}`, 60000);
    expect(score).toMatchObject({ wpm: 38, rawWpm: 40, accuracy: 95, errors: 10, typed: 200, correct: 190, seconds: 60 });
  });

  it('handles nothing typed', () => {
    expect(scoreTyping(passage, '', 60000)).toMatchObject({ wpm: 0, accuracy: 0 });
  });

  it('does not give a huge speed for a near-instant finish', () => {
    expect(scoreTyping('ab', 'ab', 1).wpm).toBe(24);
  });
});

describe('buildSegments', () => {
  it('marks correct, wrong, current and remaining text', () => {
    expect(buildSegments('abcdef', 'axc')).toEqual([
      { kind: 'correct', text: 'a' },
      { kind: 'wrong', text: 'b' },
      { kind: 'correct', text: 'c' },
      { kind: 'current', text: 'd' },
      { kind: 'rest', text: 'ef' },
    ]);
  });

  it('marks the first character as current at the start', () => {
    expect(buildSegments('ab', '')[0]).toEqual({ kind: 'current', text: 'a' });
  });
});

describe('isFinished', () => {
  it('is true when the whole text is typed', () => {
    expect(isFinished('ab', 'a')).toBe(false);
    expect(isFinished('ab', 'ab')).toBe(true);
  });
});

describe('output', () => {
  const score = scoreTyping('x'.repeat(1000), 'x'.repeat(300), 60000);

  it('builds the copied text and report', () => {
    expect(buildResultText(score)).toContain('Typing speed: 60 words per minute');
    const report = buildReport(score);
    expect(report.results[1]).toEqual({ label: 'Accuracy', value: '100%' });
    expect(report.details[3].value).toBe('60 seconds');
  });
});
