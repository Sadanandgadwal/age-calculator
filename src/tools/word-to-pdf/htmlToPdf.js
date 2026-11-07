const HEADING_SIZES = { H1: 22, H2: 18, H3: 15, H4: 13, H5: 12, H6: 11 };
const IMAGE_TYPES = /^data:image\/(png|jpe?g);base64,/i;
const SAFE_LINK = /^(https?:|mailto:)/i;
export const CONTENT_WIDTH = 451;

const collapse = (text) => text.replace(/\s+/g, ' ');

function inline(node, style, runs, images) {
  if (node.nodeType === 3) {
    const text = collapse(node.textContent);
    if (text) runs.push({ text, ...style });
    return;
  }
  if (node.nodeType !== 1) return;
  const tag = node.tagName;
  if (tag === 'BR') {
    runs.push({ text: '\n', ...style });
    return;
  }
  if (tag === 'IMG') {
    images.push(node.getAttribute('src') ?? '');
    return;
  }
  const next = { ...style };
  if (tag === 'STRONG' || tag === 'B') next.bold = true;
  if (tag === 'EM' || tag === 'I') next.italics = true;
  if (tag === 'U') next.decoration = 'underline';
  if (tag === 'S' || tag === 'DEL') next.decoration = 'lineThrough';
  if (tag === 'SUP') next.sup = true;
  if (tag === 'SUB') next.sub = true;
  if (tag === 'A') {
    const href = node.getAttribute('href') ?? '';
    if (SAFE_LINK.test(href)) Object.assign(next, { link: href, color: '#0b6657', decoration: 'underline' });
  }
  node.childNodes.forEach((child) => inline(child, next, runs, images));
}

function trimRuns(runs) {
  const list = runs.map((run) => ({ ...run }));
  while (list.length && !list[0].text.trim()) list.shift();
  while (list.length && !list.at(-1).text.trim()) list.pop();
  if (list.length) {
    list[0].text = list[0].text.replace(/^ /, '');
    list.at(-1).text = list.at(-1).text.replace(/ $/, '');
  }
  return list;
}

function imageBlocks(sources, stats) {
  return sources.flatMap((src) => {
    if (!IMAGE_TYPES.test(src)) {
      stats.skippedImages += 1;
      return [];
    }
    stats.images += 1;
    return [{ image: src, fit: [CONTENT_WIDTH, 600], margin: [0, 4, 0, 8] }];
  });
}

function textBlock(node, extra, stats) {
  const images = [];
  const runs = [];
  node.childNodes.forEach((child) => inline(child, {}, runs, images));
  const text = trimRuns(runs);
  const blocks = text.length ? [{ text, ...extra }] : [];
  return [...blocks, ...imageBlocks(images, stats)];
}

function listBlock(node, stats) {
  const items = [...node.children].filter((child) => child.tagName === 'LI').map((item) => {
    const nested = [];
    const rest = [];
    [...item.childNodes].forEach((child) => (child.nodeType === 1 && (child.tagName === 'UL' || child.tagName === 'OL') ? nested : rest).push(child));
    const holder = item.ownerDocument.createElement('p');
    rest.forEach((child) => holder.appendChild(child.cloneNode(true)));
    const content = [...textBlock(holder, {}, stats), ...nested.flatMap((child) => listBlock(child, stats))];
    if (content.length === 0) return { text: '' };
    return content.length === 1 ? content[0] : { stack: content };
  });
  stats.lists += 1;
  return [{ [node.tagName === 'OL' ? 'ol' : 'ul']: items, margin: [0, 0, 0, 8] }];
}

function tableBlock(node, stats) {
  const rows = [...node.querySelectorAll('tr')].filter((row) => row.closest('table') === node);
  const body = rows.map((row) =>
    [...row.children]
      .filter((cell) => cell.tagName === 'TD' || cell.tagName === 'TH')
      .flatMap((cell) => {
        const span = Math.max(1, Math.min(20, Number(cell.getAttribute('colspan')) || 1));
        const content = blocks(cell.childNodes, stats);
        const first = { stack: content.length ? content : [{ text: '' }], ...(cell.tagName === 'TH' ? { bold: true } : {}), ...(span > 1 ? { colSpan: span } : {}) };
        return [first, ...Array.from({ length: span - 1 }, () => ({ text: '' }))];
      }),
  );
  const columns = Math.max(1, ...body.map((row) => row.length));
  const padded = body.filter((row) => row.length).map((row) => [...row, ...Array.from({ length: columns - row.length }, () => ({ text: '' }))]);
  if (padded.length === 0) return [];
  stats.tables += 1;
  return [{ table: { headerRows: 0, widths: Array(columns).fill('*'), body: padded }, margin: [0, 4, 0, 10] }];
}

export function blocks(nodes, stats) {
  const output = [];
  let loose = [];
  const flush = () => {
    if (loose.length === 0) return;
    const holder = loose[0].ownerDocument.createElement('p');
    loose.forEach((child) => holder.appendChild(child.cloneNode(true)));
    output.push(...textBlock(holder, { margin: [0, 0, 0, 8] }, stats));
    loose = [];
  };
  for (const node of nodes) {
    const tag = node.nodeType === 1 ? node.tagName : null;
    if (tag && HEADING_SIZES[tag]) {
      flush();
      stats.headings += 1;
      output.push(...textBlock(node, { fontSize: HEADING_SIZES[tag], bold: true, margin: [0, 8, 0, 6] }, stats));
    } else if (tag === 'P') {
      flush();
      output.push(...textBlock(node, { margin: [0, 0, 0, 8] }, stats));
    } else if (tag === 'UL' || tag === 'OL') {
      flush();
      output.push(...listBlock(node, stats));
    } else if (tag === 'TABLE') {
      flush();
      output.push(...tableBlock(node, stats));
    } else if (tag === 'IMG') {
      flush();
      output.push(...imageBlocks([node.getAttribute('src') ?? ''], stats));
    } else if (tag && ['DIV', 'SECTION', 'ARTICLE', 'BLOCKQUOTE'].includes(tag)) {
      flush();
      output.push(...blocks(node.childNodes, stats));
    } else if (node.nodeType === 3 || tag) {
      loose.push(node);
    }
  }
  flush();
  return output;
}

export function htmlToContent(html) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const stats = { headings: 0, lists: 0, tables: 0, images: 0, skippedImages: 0 };
  const content = blocks(document.body.childNodes, stats);
  return { content, stats, text: document.body.textContent ?? '' };
}

const UNSUPPORTED_SCRIPTS = /[֐-ࣿऀ-෿฀-࿿က-႟ᄀ-ᇿ぀-ヿ㐀-鿿가-힯]/;

export const hasUnsupportedText = (text) => UNSUPPORTED_SCRIPTS.test(text);

export function buildDocument(content, title) {
  return {
    info: { title },
    pageSize: 'A4',
    pageMargins: [72, 72, 72, 72],
    content,
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.25 },
  };
}
