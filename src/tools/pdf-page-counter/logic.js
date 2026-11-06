import { formatBytes } from '../../utils/imageFile.js';
import { describePageSize } from '../../utils/pdfFile.js';

export function summarizeDocument(document) {
  const pages = document.getPages();
  const sizes = pages.map((page) => {
    const { width, height } = page.getSize();
    return describePageSize(width, height);
  });
  const distinct = [...new Set(sizes)];
  const isProtected = Boolean(document.isEncrypted);
  return {
    pageCount: pages.length,
    pageSize: distinct.length === 1 ? distinct[0] : distinct.length ? `Mixed: ${distinct.length} sizes, starting with ${sizes[0]}` : 'None',
    title: isProtected ? '' : (document.getTitle() ?? '').trim(),
    author: isProtected ? '' : (document.getAuthor() ?? '').trim(),
    isProtected,
  };
}

const pagesText = (count) => `${count.toLocaleString('en-US')} ${count === 1 ? 'page' : 'pages'}`;

export function totals(items) {
  const counted = items.filter((item) => item.summary);
  return { files: counted.length, pages: counted.reduce((sum, item) => sum + item.summary.pageCount, 0), failed: items.length - counted.length };
}

export function getFacts(items) {
  const total = totals(items);
  const facts = [
    { label: 'Total pages', value: total.pages.toLocaleString('en-US') },
    { label: 'Files counted', value: String(total.files) },
  ];
  return total.failed ? [...facts, { label: 'Could not be read', value: String(total.failed) }] : facts;
}

export function describeItem(item) {
  if (item.error) return item.error;
  const parts = [pagesText(item.summary.pageCount), formatBytes(item.size), item.summary.pageSize];
  if (item.summary.isProtected) parts.push('password protected');
  return parts.join(' · ');
}

export function getText(items) {
  const total = totals(items);
  const lines = items.map((item) => `${item.name}: ${item.summary ? pagesText(item.summary.pageCount) : item.error}`);
  return [...lines, `Total: ${pagesText(total.pages)} in ${total.files} ${total.files === 1 ? 'file' : 'files'}`].join('\n');
}

export function buildReport(items) {
  const total = totals(items);
  return {
    results: getFacts(items),
    table: {
      caption: 'Files',
      columns: ['File', 'Pages', 'Page size', 'Title'],
      rows: items.map((item) => (item.summary ? [item.name, String(item.summary.pageCount), item.summary.pageSize, item.summary.title || '—'] : [item.name, '—', item.error, '—'])),
    },
    notes: total.failed ? ['Some files could not be read, so they are not included in the total.'] : null,
  };
}
