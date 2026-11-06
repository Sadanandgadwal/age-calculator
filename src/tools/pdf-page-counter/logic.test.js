import { describe, expect, it } from 'vitest';
import { buildReport, describeItem, getFacts, getText, summarizeDocument, totals } from './logic.js';

const page = (width, height) => ({ getSize: () => ({ width, height }) });
const documentOf = (pages, extra = {}) => ({ getPages: () => pages, getTitle: () => ' Annual Report ', getAuthor: () => 'Asha', isEncrypted: false, ...extra });

describe('summarizeDocument', () => {
  it('reads pages, size and details', () =>
    expect(summarizeDocument(documentOf([page(595.28, 841.89), page(595.28, 841.89)]))).toEqual({ pageCount: 2, pageSize: 'A4 portrait, 210 × 297 mm', title: 'Annual Report', author: 'Asha', isProtected: false }));
  it('notices mixed sizes', () => expect(summarizeDocument(documentOf([page(595.28, 841.89), page(792, 612)])).pageSize).toBe('Mixed: 2 sizes, starting with A4 portrait, 210 × 297 mm'));
  it('hides details of a protected file', () => {
    const summary = summarizeDocument(documentOf([page(612, 792)], { isEncrypted: true }));
    expect(summary).toMatchObject({ pageCount: 1, title: '', author: '', isProtected: true });
  });
  it('handles a missing title', () => expect(summarizeDocument(documentOf([page(612, 792)], { getTitle: () => undefined, getAuthor: () => undefined })).title).toBe(''));
});

const items = [
  { id: 1, name: 'a.pdf', size: 2048, summary: { pageCount: 3, pageSize: 'A4 portrait, 210 × 297 mm', title: 'A', isProtected: false } },
  { id: 2, name: 'b.pdf', size: 1024, summary: { pageCount: 1, pageSize: 'Letter portrait, 216 × 279 mm', title: '', isProtected: true } },
  { id: 3, name: 'c.pdf', size: 10, error: 'This PDF could not be read.' },
];

describe('totals and output', () => {
  it('adds up readable files', () => expect(totals(items)).toEqual({ files: 2, pages: 4, failed: 1 }));
  it('lists facts with failures', () =>
    expect(getFacts(items)).toEqual([
      { label: 'Total pages', value: '4' },
      { label: 'Files counted', value: '2' },
      { label: 'Could not be read', value: '1' },
    ]));
  it('leaves out failures when there are none', () => expect(getFacts(items.slice(0, 1))).toHaveLength(2));
  it('describes a file', () => {
    expect(describeItem(items[0])).toBe('3 pages · 2 KB · A4 portrait, 210 × 297 mm');
    expect(describeItem(items[1])).toBe('1 page · 1 KB · Letter portrait, 216 × 279 mm · password protected');
    expect(describeItem(items[2])).toBe('This PDF could not be read.');
  });
  it('writes the text', () => expect(getText(items)).toBe('a.pdf: 3 pages\nb.pdf: 1 page\nc.pdf: This PDF could not be read.\nTotal: 4 pages in 2 files'));
  it('builds the report', () => {
    const report = buildReport(items);
    expect(report.table.rows[0]).toEqual(['a.pdf', '3', 'A4 portrait, 210 × 297 mm', 'A']);
    expect(report.table.rows[1][3]).toBe('—');
    expect(report.table.rows[2]).toEqual(['c.pdf', '—', 'This PDF could not be read.', '—']);
    expect(report.notes).toHaveLength(1);
  });
  it('has no note when every file was read', () => expect(buildReport(items.slice(0, 2)).notes).toBeNull());
});
