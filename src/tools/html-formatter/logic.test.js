import { describe, expect, it } from 'vitest';
import { buildReport, evaluate, formatHtml } from './logic.js';

describe('formatHtml', () => {
  it('indents nested elements', () => {
    expect(formatHtml('<ul><li>One</li><li>Two</li></ul>', 'two')).toBe('<ul>\n  <li>One</li>\n  <li>Two</li>\n</ul>');
  });

  it('follows the indent choice', () => {
    expect(formatHtml('<div><p>a</p></div>', 'four')).toBe('<div>\n    <p>a</p>\n</div>');
    expect(formatHtml('<div><p>a</p></div>', 'tab')).toBe('<div>\n\t<p>a</p>\n</div>');
  });

  it('keeps inline elements with their text', () => {
    expect(formatHtml('<p>Hello <b>big</b> world</p>', 'two')).toBe('<p>Hello <b>big</b> world</p>');
  });

  it('keeps script contents as they are, and runs nothing', () => {
    window.__ran = false;
    const output = formatHtml('<div><script>window.__ran=true</script><img src=x onerror="window.__ran=true"></div>', 'two');
    expect(output).toContain('window.__ran=true');
    expect(window.__ran).toBe(false);
  });

  it('copes with broken HTML', () => {
    expect(formatHtml('<div><p>open', 'two')).toContain('open');
    expect(() => formatHtml('<<<>>></', 'two')).not.toThrow();
  });
});

describe('evaluate and report', () => {
  it('has nothing for blank text', () => {
    expect(evaluate(' ', 'two')).toEqual({ error: null, output: null });
  });

  it('builds a monospace report', () => {
    const report = buildReport('<a>\n</a>', 'tab');
    expect(report.inputs[0].value).toBe('Tab');
    expect(report.results[0].value).toBe('2');
    expect(report.text.mono).toBe(true);
  });
});
