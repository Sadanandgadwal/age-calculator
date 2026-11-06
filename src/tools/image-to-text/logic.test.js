import { describe, expect, it } from 'vitest';
import { cleanText, describeProgress, getFacts, getNote, scaleFor, textFilename } from './logic.js';

describe('describeProgress', () => {
  it('names the steps', () => {
    expect(describeProgress({ status: 'loading language traineddata', progress: 0.5 })).toEqual({ label: 'Loading English language data', percent: 50 });
    expect(describeProgress({ status: 'recognizing text', progress: 0.333 })).toEqual({ label: 'Reading the text', percent: 33 });
  });
  it('handles unknown steps', () => expect(describeProgress({ status: 'something new' })).toEqual({ label: 'Preparing', percent: 0 }));
  it('keeps the percent in range', () => expect(describeProgress({ status: 'recognizing text', progress: 1.4 }).percent).toBe(100));
});

describe('cleanText', () => {
  it('removes trailing spaces and extra blank lines', () => expect(cleanText('  Hello  \nworld \n\n\n\nEnd\n\n')).toBe('Hello\nworld\n\nEnd'));
  it('keeps single blank lines', () => expect(cleanText('a\n\nb')).toBe('a\n\nb'));
  it('gives an empty string for spaces', () => expect(cleanText(' \n \n')).toBe(''));
});

describe('getFacts', () => {
  it('counts words, lines and characters', () =>
    expect(getFacts('Hello world\n\nSecond line', 91.6)).toEqual([
      { label: 'Words', value: '4' },
      { label: 'Lines', value: '2' },
      { label: 'Characters', value: '24' },
      { label: 'Confidence', value: '92%' },
    ]));
});

describe('getNote', () => {
  it('warns about low confidence', () => expect(getNote(59)).toMatch(/not sure/));
  it('reminds to check otherwise', () => expect(getNote(60)).toMatch(/Check the text/));
});

it('scales only large images', () => {
  expect(scaleFor(1200, 800)).toBe(1);
  expect(scaleFor(6000, 3000)).toBe(0.5);
});

it('names the text file', () => {
  expect(textFilename('receipt.photo.jpg')).toBe('receipt.photo-text.txt');
  expect(textFilename('')).toBe('image-text.txt');
});
