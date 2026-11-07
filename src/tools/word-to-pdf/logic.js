import { formatBytes } from '../../utils/imageFile.js';
import { buildDocument, hasUnsupportedText, htmlToContent } from './htmlToPdf.js';

export const MAX_WORD_BYTES = 50 * 1024 * 1024;
const WORD_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const UNREADABLE_WORD = 'This Word file could not be read. It may be damaged or password protected. Please try another file.';
export const EMPTY_WORD = 'This document has no text or images that could be converted.';
export const LAYOUT_NOTE = 'Page layout, headers, footers, page numbers, text colours and exact fonts are not kept.';
export const SCRIPT_NOTE = 'Some text uses a script this converter cannot show, such as Hindi, Arabic, Chinese or Japanese. That text will be missing from the PDF.';

export function checkWordFile(file) {
  if (/\.doc$/i.test(file.name) || file.type === 'application/msword') return 'Older .doc files are not supported. Open the file in Word and save it as .docx first.';
  if (!/\.docx$/i.test(file.name) && file.type !== WORD_TYPE) return 'Please choose a Word document (.docx).';
  if (file.size === 0) return 'This file is empty. Please choose another document.';
  if (file.size > MAX_WORD_BYTES) return `This document is larger than ${formatBytes(MAX_WORD_BYTES)}. Please choose a smaller one.`;
  return null;
}

export const isZip = (bytes) => bytes[0] === 0x50 && bytes[1] === 0x4b;

export async function readWordHtml(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isZip(bytes)) throw new Error(UNREADABLE_WORD);
  const mammoth = await import('mammoth');
  try {
    const { value } = await (mammoth.default ?? mammoth).convertToHtml({ arrayBuffer: bytes.buffer, buffer: bytes });
    return value;
  } catch (error) {
    throw new Error(UNREADABLE_WORD, { cause: error });
  }
}

export async function renderPdf(definition) {
  const [library, fonts] = await Promise.all([import('pdfmake/build/pdfmake'), import('pdfmake/build/vfs_fonts')]);
  const pdfMake = library.default ?? library;
  pdfMake.addVirtualFileSystem(fonts.default ?? fonts);
  pdfMake.setUrlAccessPolicy(() => false);
  return pdfMake.createPdf(definition).getBlob();
}

export function prepare(html, title) {
  const { content, stats, text } = htmlToContent(html);
  if (content.length === 0) throw new Error(EMPTY_WORD);
  const notes = [LAYOUT_NOTE];
  if (hasUnsupportedText(text)) notes.unshift(SCRIPT_NOTE);
  if (stats.skippedImages) notes.unshift(`${stats.skippedImages} ${stats.skippedImages === 1 ? 'image was' : 'images were'} left out, as only PNG and JPEG images can be added.`);
  return { definition: buildDocument(content, title), stats, notes };
}

export function getFacts(stats, pageCount, blob) {
  return [
    { label: 'Pages', value: String(pageCount) },
    { label: 'File size', value: formatBytes(blob.size) },
    { label: 'Headings', value: String(stats.headings) },
    { label: 'Lists', value: String(stats.lists) },
    { label: 'Tables', value: String(stats.tables) },
    { label: 'Images', value: String(stats.images) },
  ];
}

export const titleFrom = (name) => (name ?? '').replace(/\.[^.]*$/, '').trim() || 'Document';
