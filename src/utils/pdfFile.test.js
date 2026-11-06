import { describe, expect, it } from 'vitest';
import { MAX_PDF_BYTES, PASSWORD_MESSAGE, WRONG_PASSWORD_MESSAGE, UNREADABLE_MESSAGE, MEMORY_MESSAGE, checkPdfFile, describePageSize, describePdfError, hasPdfHeader, pdfFilename, readPdfBytes } from './pdfFile.js';

const make = (name, type, content = '%PDF-1.7\n', size) => {
  const file = new File([content], name, { type });
  if (size !== undefined) Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('checkPdfFile', () => {
  it('accepts a PDF by type', () => expect(checkPdfFile(make('a', 'application/pdf'))).toBeNull());
  it('accepts a PDF by name', () => expect(checkPdfFile(make('a.PDF', ''))).toBeNull());
  it('rejects other files', () => expect(checkPdfFile(make('a.docx', 'application/msword'))).toMatch(/choose a PDF/));
  it('rejects an empty file', () => expect(checkPdfFile(make('a.pdf', 'application/pdf', '', 0))).toMatch(/empty/));
  it('accepts exactly 100 MB', () => expect(checkPdfFile(make('a.pdf', 'application/pdf', 'x', MAX_PDF_BYTES))).toBeNull());
  it('rejects over 100 MB', () => expect(checkPdfFile(make('a.pdf', 'application/pdf', 'x', MAX_PDF_BYTES + 1))).toMatch(/larger than 100 MB/));
});

describe('hasPdfHeader', () => {
  const bytes = (text) => new TextEncoder().encode(text);
  it('finds the header at the start', () => expect(hasPdfHeader(bytes('%PDF-1.4\n'))).toBe(true));
  it('finds a header after some junk', () => expect(hasPdfHeader(bytes(`${' '.repeat(500)}%PDF-1.4`))).toBe(true));
  it('rejects a header too far in', () => expect(hasPdfHeader(bytes(`${' '.repeat(1100)}%PDF-1.4`))).toBe(false));
  it('rejects other files', () => expect(hasPdfHeader(bytes('PK\u0003\u0004'))).toBe(false));
});

describe('readPdfBytes', () => {
  it('reads a PDF', async () => expect((await readPdfBytes(make('a.pdf', 'application/pdf'))).length).toBe(9));
  it('rejects a file named .pdf that is not one', async () => expect(readPdfBytes(make('a.pdf', 'application/pdf', 'hello'))).rejects.toThrow(/not a PDF/));
  it('rejects other files before reading them', async () => expect(readPdfBytes(make('a.txt', 'text/plain'))).rejects.toThrow(/choose a PDF/));
});

describe('describePdfError', () => {
  it('explains a protected file', () => expect(describePdfError(Object.assign(new Error('x'), { name: 'EncryptedPDFError' }))).toBe(PASSWORD_MESSAGE));
  it('explains a wrong password', () => expect(describePdfError(new Error('Password incorrect'))).toBe(WRONG_PASSWORD_MESSAGE));
  it('explains running out of memory', () => expect(describePdfError(new RangeError('Array buffer allocation failed'))).toBe(MEMORY_MESSAGE));
  it('falls back to a damaged file', () => expect(describePdfError(new Error('Failed to parse'))).toBe(UNREADABLE_MESSAGE));
});

describe('describePageSize', () => {
  it.each([
    [595.28, 841.89, 'A4 portrait, 210 × 297 mm'],
    [841.89, 595.28, 'A4 landscape, 297 × 210 mm'],
    [612, 792, 'Letter portrait, 216 × 279 mm'],
    [612, 1008, 'Legal portrait, 216 × 356 mm'],
    [419.53, 595.28, 'A5 portrait, 148 × 210 mm'],
    [500, 500, '176 × 176 mm, square'],
    [300, 200, '106 × 71 mm, landscape'],
  ])('%f × %f points is %s', (width, height, text) => expect(describePageSize(width, height)).toBe(text));
});

describe('pdfFilename', () => {
  it('adds a suffix', () => expect(pdfFilename('report.final.pdf', 'merged')).toBe('report.final-merged.pdf'));
  it('changes the extension', () => expect(pdfFilename('a.pdf', 'pages', 'zip')).toBe('a-pages.zip'));
  it('falls back to document', () => expect(pdfFilename('<>.pdf', 'x')).toBe('document-x.pdf'));
});
