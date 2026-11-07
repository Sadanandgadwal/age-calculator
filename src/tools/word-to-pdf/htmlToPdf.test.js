import { describe, expect, it } from 'vitest';
import { buildDocument, hasUnsupportedText, htmlToContent } from './htmlToPdf.js';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';

describe('htmlToContent', () => {
  it('keeps headings, paragraphs and inline styles', () => {
    const { content, stats } = htmlToContent('<h1>Title</h1><p>Sales grew <strong>twelve</strong> in <em>Q3</em> <u>now</u>.</p>');
    expect(content[0]).toMatchObject({ text: [{ text: 'Title' }], fontSize: 22, bold: true });
    expect(content[1].text).toEqual([{ text: 'Sales grew ' }, { text: 'twelve', bold: true }, { text: ' in ' }, { text: 'Q3', italics: true }, { text: ' ' }, { text: 'now', decoration: 'underline' }, { text: '.' }]);
    expect(stats.headings).toBe(1);
  });

  it('keeps safe links only', () => {
    const { content } = htmlToContent('<p><a href="https://example.com">site</a> <a href="javascript:alert(1)">bad</a></p>');
    expect(content[0].text[0]).toMatchObject({ text: 'site', link: 'https://example.com' });
    expect(content[0].text[2]).toEqual({ text: 'bad' });
  });

  it('builds bulleted, numbered and nested lists', () => {
    const { content, stats } = htmlToContent('<ul><li>One</li><li>Two<ol><li>Inner</li></ol></li></ul>');
    expect(content[0].ul[0]).toMatchObject({ text: [{ text: 'One' }] });
    expect(content[0].ul[1].stack[1].ol[0]).toMatchObject({ text: [{ text: 'Inner' }] });
    expect(stats.lists).toBe(2);
  });

  it('builds tables with equal columns and spans', () => {
    const { content, stats } = htmlToContent('<table><tr><td colspan="2"><p>Wide</p></td></tr><tr><td><p>A</p></td><td><p>B</p></td><td><p>C</p></td></tr></table>');
    const { body, widths } = content[0].table;
    expect(widths).toEqual(['*', '*', '*']);
    expect(body[0]).toHaveLength(3);
    expect(body[0][0]).toMatchObject({ colSpan: 2 });
    expect(body[1][2].stack[0]).toMatchObject({ text: [{ text: 'C' }] });
    expect(stats.tables).toBe(1);
  });

  it('adds PNG and JPEG images and skips others', () => {
    const { content, stats } = htmlToContent(`<p>Look<img src="${PNG}" /></p><p><img src="data:image/x-emf;base64,AAAA" /></p><img src="https://example.com/a.png" />`);
    expect(content).toEqual([{ text: [{ text: 'Look' }], margin: [0, 0, 0, 8] }, { image: PNG, fit: [451, 600], margin: [0, 4, 0, 8] }]);
    expect(stats).toMatchObject({ images: 1, skippedImages: 2 });
  });

  it('turns line breaks into new lines and skips empty paragraphs', () => {
    const { content } = htmlToContent('<p>One<br />Two</p><p>  </p>');
    expect(content).toHaveLength(1);
    expect(content[0].text.map(({ text }) => text).join('')).toBe('One\nTwo');
  });
});

describe('helpers', () => {
  it('spots scripts the font cannot show', () => {
    expect(hasUnsupportedText('Hello, café, Привет')).toBe(false);
    expect(hasUnsupportedText('नमस्ते')).toBe(true);
    expect(hasUnsupportedText('你好')).toBe(true);
  });

  it('sets up an A4 document', () => {
    expect(buildDocument([], 'Report')).toMatchObject({ pageSize: 'A4', info: { title: 'Report' }, pageMargins: [72, 72, 72, 72] });
  });
});
