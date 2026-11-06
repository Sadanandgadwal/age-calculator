import { formatBytes } from './imageFile.js';

export const MAX_PDF_BYTES = 100 * 1024 * 1024;
export const MAX_PDF_FILES = 50;
const HEADER = '%PDF-';

export const PASSWORD_MESSAGE = 'This PDF is password protected. Remove the password first with Unlock PDF, then try again.';
export const WRONG_PASSWORD_MESSAGE = 'This password is not correct. Please check it and try again.';
export const UNREADABLE_MESSAGE = 'This PDF could not be read. It may be damaged, so please try another file.';
export const MEMORY_MESSAGE = 'This browser ran out of memory. Try a smaller file, or a computer instead of a phone.';

export function checkPdfFile(file, maxBytes = MAX_PDF_BYTES) {
  const looksLikePdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!looksLikePdf) return 'Please choose a PDF file.';
  if (file.size === 0) return 'This file is empty. Please choose another PDF.';
  if (file.size > maxBytes) return `This PDF is larger than ${formatBytes(maxBytes)}. Please choose a smaller one.`;
  return null;
}

export function hasPdfHeader(bytes) {
  const start = new TextDecoder('latin1').decode(bytes.subarray(0, 1024));
  return start.includes(HEADER);
}

export async function readPdfBytes(file, maxBytes) {
  const problem = checkPdfFile(file, maxBytes);
  if (problem) throw new Error(problem);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPdfHeader(bytes)) throw new Error('This file is not a PDF, even though its name ends in .pdf.');
  return bytes;
}

export function describePdfError(error) {
  if (error?.name === 'EncryptedPDFError' || /is encrypted/i.test(error?.message ?? '')) return PASSWORD_MESSAGE;
  if (/password incorrect/i.test(error?.message ?? '')) return WRONG_PASSWORD_MESSAGE;
  if (error instanceof RangeError || /out of memory|allocation failed/i.test(error?.message ?? '')) return MEMORY_MESSAGE;
  return UNREADABLE_MESSAGE;
}

export const loadPdfLib = () => import('@cantoo/pdf-lib');

export async function loadPdf(bytes, options = {}) {
  const { PDFDocument } = await loadPdfLib();
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false, ...options });
  } catch (error) {
    throw new Error(describePdfError(error), { cause: error });
  }
}

export async function openPdf(file, options) {
  const bytes = await readPdfBytes(file);
  const document = await loadPdf(bytes, options);
  return { file, bytes, document, name: file.name, size: file.size, pageCount: document.getPageCount() };
}

export async function savePdf(document) {
  try {
    return new Blob([await document.save()], { type: 'application/pdf' });
  } catch (error) {
    throw new Error(error instanceof RangeError ? MEMORY_MESSAGE : 'The PDF could not be created. Please try again.', { cause: error });
  }
}

export async function copyPagesTo(source, indexes) {
  const { PDFDocument } = await loadPdfLib();
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach((page) => output.addPage(page));
  return output;
}

export function pdfFilename(name, suffix, extension = 'pdf') {
  const base = (name ?? '').replace(/\.[^.]*$/, '').replace(/[^\p{L}\p{M}\p{N}._ -]/gu, '').trim() || 'document';
  return `${base}-${suffix}.${extension}`;
}

export const PAPER_SIZES = [
  { name: 'A3', width: 297, height: 420 },
  { name: 'A4', width: 210, height: 297 },
  { name: 'A5', width: 148, height: 210 },
  { name: 'Letter', width: 215.9, height: 279.4 },
  { name: 'Legal', width: 215.9, height: 355.6 },
  { name: 'Tabloid', width: 279.4, height: 431.8 },
];

const POINTS_PER_MM = 72 / 25.4;

export function describePageSize(widthPoints, heightPoints) {
  const width = widthPoints / POINTS_PER_MM;
  const height = heightPoints / POINTS_PER_MM;
  const short = Math.min(width, height);
  const long = Math.max(width, height);
  const paper = PAPER_SIZES.find((item) => Math.abs(item.width - short) < 2 && Math.abs(item.height - long) < 2);
  const orientation = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
  const size = `${Math.round(width)} × ${Math.round(height)} mm`;
  return paper ? `${paper.name} ${orientation}, ${size}` : `${size}, ${orientation}`;
}
