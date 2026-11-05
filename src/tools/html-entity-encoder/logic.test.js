import { describe, expect, it } from 'vitest';
import { buildReport, decodeEntities, encodeEntities, evaluate } from './logic.js';

describe('encodeEntities', () => {
  it('escapes the essential characters', () => {
    expect(encodeEntities('<b class="x">Tom & \'J\'</b>')).toBe('&lt;b class=&quot;x&quot;&gt;Tom &amp; &#39;J&#39;&lt;/b&gt;');
  });

  it('leaves other text alone by default', () => {
    expect(encodeEntities('é नमस्ते')).toBe('é नमस्ते');
  });

  it('can encode all non-English characters, keeping emoji whole', () => {
    expect(encodeEntities('é😀a', true)).toBe('&#233;&#128512;a');
  });
});

describe('decodeEntities', () => {
  it.each([
    ['&lt;b&gt;', '<b>'],
    ['&copy; &ndash;', '© –'],
    ['&#169; &#xA9;', '© ©'],
    ['Tom &amp; Jerry', 'Tom & Jerry'],
    ['no entities', 'no entities'],
    ['&amp;lt;', '&lt;'],
    ['\nfirst line', '\nfirst line'],
  ])('decodes %j', (text, expected) => {
    expect(decodeEntities(text)).toBe(expected);
  });

  it('treats HTML only as text, and runs nothing', () => {
    window.__ran = false;
    const attack = '</textarea><img src=x onerror="window.__ran=true"><script>window.__ran=true</script>';
    expect(decodeEntities(attack)).toBe(attack);
    expect(window.__ran).toBe(false);
  });
});

describe('evaluate and report', () => {
  it('follows the mode', () => {
    expect(evaluate('encode', '<', false)).toBe('&lt;');
    expect(evaluate('decode', '&lt;', false)).toBe('<');
    expect(evaluate('encode', '', false)).toBeNull();
  });

  it('builds the report', () => {
    expect(buildReport('encode', true, 'a').inputs[1].value).toBe('Yes');
    expect(buildReport('decode', true, 'a').inputs).toHaveLength(1);
  });
});
