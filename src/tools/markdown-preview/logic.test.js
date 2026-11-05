import { describe, expect, it } from 'vitest';
import { blockedNote, buildReport, evaluate, renderMarkdown } from './logic.js';

describe('renderMarkdown', () => {
  it('renders the basics and GitHub features', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>');
    expect(renderMarkdown('**b** *i*')).toContain('<strong>b</strong> <em>i</em>');
    expect(renderMarkdown('| a |\n|---|\n| b |')).toContain('<td>b</td>');
    expect(renderMarkdown('~~gone~~')).toContain('<del>gone</del>');
    expect(renderMarkdown('```\ncode\n```')).toContain('<code>code');
  });

  it.each([
    ['<script>window.__x=1</script>', '<script'],
    ['<img src=x onerror=alert(1)>', 'onerror'],
    ['[a](javascript:alert(1))', 'javascript:'],
    ['[a](JaVaScRiPt:alert(1))', 'alert'],
    ['<a href="javascript:alert(1)">a</a>', 'javascript:'],
    ['<svg onload=alert(1)></svg>', 'onload'],
    ['<svg><script>alert(1)</script></svg>', 'alert'],
    ['<iframe src="https://evil.example"></iframe>', 'iframe'],
    ['<object data="https://evil.example"></object>', 'object'],
    ['<style>@import url(https://evil.example/a.css)</style>', 'evil.example'],
    ['<div style="background:url(https://evil.example/a.png)">x</div>', 'evil.example'],
    ['<form action="https://evil.example"><input name=a></form>', 'evil.example'],
    ['<meta http-equiv="refresh" content="0;url=https://evil.example">', 'evil.example'],
    ['<base href="https://evil.example/">', 'evil.example'],
    ['<video src="https://evil.example/a.mp4"></video>', 'evil.example'],
    ['![a](https://evil.example/a.png)', 'evil.example'],
    ['<img srcset="https://evil.example/a.png 1x">', 'evil.example'],
  ])('removes the danger from %s', (input, forbidden) => {
    expect(renderMarkdown(input).toLowerCase()).not.toContain(forbidden);
  });

  it('makes links open safely', () => {
    const html = renderMarkdown('[a](https://example.com)');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it('gives every image an alt attribute', () => {
    expect(renderMarkdown('<img src="data:image/png;base64,AAAA">')).toContain('alt=""');
  });

  it('keeps alt text for remote images, and shows embedded images', () => {
    expect(renderMarkdown('![My chart](https://x.example/a.png)')).toContain('alt="My chart"');
    expect(renderMarkdown('![a](data:image/png;base64,AAAA)')).toContain('src="data:image/png');
  });
});

describe('evaluate and report', () => {
  it('has no result for blank text', () => {
    expect(evaluate('  ')).toBeNull();
  });

  it('counts words and blocked images', () => {
    const result = evaluate('Hello there ![a](https://x.example/a.png)');
    expect(result.blockedImages).toBe(1);
    expect(blockedNote(result)).toContain('1 remote image was');
    expect(blockedNote(evaluate('plain'))).toBeNull();
  });

  it('builds the report', () => {
    const report = buildReport(evaluate('one two'), 'view');
    expect(report.results[0].value).toBe('2');
    expect(report.visual).toBe('view');
    expect(report.notes).toBeNull();
  });
});
