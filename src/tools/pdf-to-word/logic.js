import { formatBytes } from '../../utils/imageFile.js';

export const NO_TEXT = 'This PDF has no text that can be copied, so it is probably a scan or a picture. Use Image to Text to read the words from a scan instead.';
export const LAYOUT_NOTE = 'Only the text is converted, as plain paragraphs and headings. Layout, tables, images, columns and fonts are not kept.';

export function toLines(items) {
  const lines = [];
  let text = '';
  let y = null;
  let size = 0;
  const finish = () => {
    if (text.trim()) lines.push({ text: text.replace(/\s+/g, ' ').trim(), y, size });
    else if (lines.length && !lines.at(-1).gap) lines.push({ gap: true });
    text = '';
    y = null;
    size = 0;
  };
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    const itemY = item.transform?.[5] ?? 0;
    const itemSize = Math.abs(item.height || item.transform?.[3] || 0);
    if (text.trim() && y !== null && item.str.trim() && Math.abs(itemY - y) > Math.max(size, itemSize) * 0.6) finish();
    if (item.str.trim() && y === null) y = itemY;
    text += item.str;
    if (item.str.trim()) size = Math.max(size, itemSize);
    if (item.hasEOL) finish();
  }
  finish();
  while (lines.at(-1)?.gap) lines.pop();
  return lines;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};

export const bodySizeOf = (pages) => median(pages.flat().filter((line) => !line.gap).map((line) => line.size));

export function toParagraphs(lines, bodySize) {
  const paragraphs = [];
  let current = null;
  let previous = null;
  const close = () => {
    if (current) paragraphs.push(current);
    current = null;
  };
  for (const line of lines) {
    if (line.gap) {
      close();
      previous = null;
      continue;
    }
    const heading = bodySize > 0 && line.size >= bodySize * 1.25 && line.text.length <= 120;
    const spacing = previous ? Math.abs(previous.y - line.y) : 0;
    if (!current || heading !== current.heading || spacing > Math.max(previous.size, line.size) * 1.8) {
      close();
      current = { text: line.text, heading };
    } else if (/[A-Za-z]-$/.test(current.text) && /^[a-z]/.test(line.text)) {
      current.text = current.text.slice(0, -1) + line.text;
    } else {
      current.text = `${current.text} ${line.text}`;
    }
    previous = line;
  }
  close();
  return paragraphs;
}

export function summarize(pages) {
  const paragraphs = pages.flat();
  return {
    pages: pages.length,
    emptyPages: pages.filter((page) => page.length === 0).length,
    paragraphs: paragraphs.filter((item) => !item.heading).length,
    headings: paragraphs.filter((item) => item.heading).length,
    words: paragraphs.reduce((total, item) => total + item.text.split(/\s+/).filter(Boolean).length, 0),
  };
}

export async function buildDocx(pages, title) {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const children = [];
  pages.forEach((paragraphs, pageIndex) => {
    paragraphs.forEach((paragraph, index) => {
      children.push(
        new Paragraph({
          ...(paragraph.heading ? { heading: HeadingLevel.HEADING_2 } : {}),
          pageBreakBefore: pageIndex > 0 && index === 0,
          spacing: { after: 160 },
          children: [new TextRun(paragraph.text)],
        }),
      );
    });
  });
  const document = new Document({ title, creator: 'ToolNest', sections: [{ children }] });
  return Packer.toBlob(document);
}

export function getFacts(summary, blob) {
  return [
    { label: 'Pages', value: String(summary.pages) },
    { label: 'Paragraphs', value: String(summary.paragraphs) },
    { label: 'Headings', value: String(summary.headings) },
    { label: 'Words', value: summary.words.toLocaleString('en-IN') },
    ...(summary.emptyPages ? [{ label: 'Pages without text', value: String(summary.emptyPages) }] : []),
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
