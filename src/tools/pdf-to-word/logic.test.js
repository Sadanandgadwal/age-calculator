import { describe, expect, it } from 'vitest';
import mammoth from 'mammoth';
import { bodySizeOf, buildDocx, getFacts, summarize, toLines, toParagraphs } from './logic.js';

const item = (str, y, size = 11, hasEOL = true) => ({ str, transform: [size, 0, 0, size, 72, y], height: size, hasEOL });

describe('toLines', () => {
  it('joins items into lines and marks gaps', () => {
    const lines = toLines([item('Part', 700, 11, false), item(' two', 700), item('', 0, 0), item('Next', 680)]);
    expect(lines).toEqual([{ text: 'Part two', y: 700, size: 11 }, { gap: true }, { text: 'Next', y: 680, size: 11 }]);
  });

  it('starts a new line when the text moves down without an end of line', () => {
    expect(toLines([item('Top', 700, 11, false), item('Bottom', 650, 11, false)]).map(({ text }) => text)).toEqual(['Top', 'Bottom']);
  });

  it('ignores items without text', () => {
    expect(toLines([{ type: 'beginMarkedContent' }, item('Only', 500)])).toHaveLength(1);
  });
});

describe('toParagraphs', () => {
  const lines = toLines([
    item('Big Title', 800, 20),
    item('', 0, 0),
    item('This is a para-', 760),
    item('graph that continues.', 746),
    item('Far below', 600),
  ]);

  it('joins lines, mends hyphens and finds headings', () => {
    expect(toParagraphs(lines, bodySizeOf([lines]))).toEqual([
      { text: 'Big Title', heading: true },
      { text: 'This is a paragraph that continues.', heading: false },
      { text: 'Far below', heading: false },
    ]);
  });

  it('uses the most common text size as body text', () => {
    expect(bodySizeOf([lines])).toBe(11);
  });
});

describe('summarize and facts', () => {
  it('counts pages, paragraphs, headings and words', () => {
    const summary = summarize([[{ text: 'Title', heading: true }, { text: 'Two words', heading: false }], []]);
    expect(summary).toEqual({ pages: 2, emptyPages: 1, paragraphs: 1, headings: 1, words: 3 });
    expect(getFacts(summary, { size: 1024 }).map(({ label }) => label)).toEqual(['Pages', 'Paragraphs', 'Headings', 'Words', 'Pages without text', 'File size']);
  });
});

describe('buildDocx', () => {
  it('writes a Word file with the text', async () => {
    const blob = await buildDocx([[{ text: 'Report', heading: true }, { text: 'First page text.', heading: false }], [{ text: 'Second page text.', heading: false }]], 'Report');
    const { value } = await mammoth.convertToHtml({ buffer: new Uint8Array(await blob.arrayBuffer()) });
    expect(value).toContain('Report');
    expect(value).toContain('<p>First page text.</p>');
    expect(value).toContain('<p>Second page text.</p>');
  });
});
