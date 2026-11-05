import { describe, expect, it } from 'vitest';
import { DISPLAY_LIMIT, altFromName, formatOutput, getFacts, previewOutput } from './logic.js';

const URL_TEXT = 'data:image/png;base64,QUJD';

describe('formatOutput', () => {
  it('gives the data URI', () => expect(formatOutput(URL_TEXT, 'datauri')).toBe(URL_TEXT));
  it('gives plain Base64', () => expect(formatOutput(URL_TEXT, 'base64')).toBe('QUJD'));
  it('gives an image tag', () => expect(formatOutput(URL_TEXT, 'html', 'logo')).toBe(`<img src="${URL_TEXT}" alt="logo">`));
  it('escapes the description', () => expect(formatOutput(URL_TEXT, 'html', 'a"b<c&d')).toBe(`<img src="${URL_TEXT}" alt="a&quot;b&lt;c&amp;d">`));
  it('gives a CSS rule', () => expect(formatOutput(URL_TEXT, 'css')).toBe(`background-image: url("${URL_TEXT}");`));
});

describe('previewOutput', () => {
  it('shows short text in full', () => expect(previewOutput('abc')).toEqual({ text: 'abc', isPartial: false }));
  it('shows text exactly at the limit in full', () => expect(previewOutput('a'.repeat(DISPLAY_LIMIT)).isPartial).toBe(false));
  it('shortens long text', () => {
    const preview = previewOutput('a'.repeat(DISPLAY_LIMIT + 1));
    expect(preview.isPartial).toBe(true);
    expect(preview.text).toHaveLength(DISPLAY_LIMIT + 1);
    expect(preview.text.endsWith('…')).toBe(true);
  });
});

describe('getFacts', () => {
  it('describes the image and the increase', () => {
    const facts = getFacts({ type: 'image/png', width: 10, height: 5, size: 3 }, URL_TEXT);
    expect(facts).toEqual([
      { label: 'Format', value: 'PNG' },
      { label: 'Dimensions', value: '10 × 5 px' },
      { label: 'Image size', value: '3 B' },
      { label: 'Base64 length', value: '4 characters' },
      { label: 'Increase', value: '33%' },
    ]);
  });
});

it('removes the extension for the description', () => expect(altFromName('my.logo.png')).toBe('my.logo'));
