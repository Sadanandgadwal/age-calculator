import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EMPTY_WORD, LAYOUT_NOTE, SCRIPT_NOTE, UNREADABLE_WORD, checkWordFile, getFacts, prepare, readWordHtml, titleFrom } from './logic.js';

const docx = readFileSync('scripts/fixtures/word-sample.docx');
const wordFile = (bytes, name = 'report.docx') => new File([bytes], name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

describe('checkWordFile', () => {
  it('accepts .docx and explains other files', () => {
    expect(checkWordFile(wordFile(docx))).toBeNull();
    expect(checkWordFile(new File(['x'], 'old.doc'))).toBe('Older .doc files are not supported. Open the file in Word and save it as .docx first.');
    expect(checkWordFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBe('Please choose a Word document (.docx).');
    expect(checkWordFile(new File([], 'a.docx'))).toBe('This file is empty. Please choose another document.');
  });
});

describe('readWordHtml', () => {
  it('reads the sample document', async () => {
    const html = await readWordHtml(wordFile(docx));
    expect(html).toContain('<h1>Quarterly Report</h1>');
    expect(html).toContain('<table>');
  });

  it('rejects a file that is not a Word document', async () => {
    await expect(readWordHtml(wordFile(new Uint8Array([1, 2, 3])))).rejects.toThrow(UNREADABLE_WORD);
    await expect(readWordHtml(wordFile(new Uint8Array([0x50, 0x4b, 3, 4, 0, 0])))).rejects.toThrow(UNREADABLE_WORD);
  });
});

describe('prepare', () => {
  it('counts what was converted and notes what is lost', async () => {
    const { definition, stats, notes } = prepare(await readWordHtml(wordFile(docx)), 'Report');
    expect(stats).toEqual({ headings: 2, lists: 2, tables: 1, images: 1, skippedImages: 0 });
    expect(definition.info.title).toBe('Report');
    expect(notes).toEqual([LAYOUT_NOTE]);
  });

  it('warns about missing scripts and images, and refuses an empty document', () => {
    expect(prepare('<p>नमस्ते</p><img src="data:image/gif;base64,R0lG" />', 'x').notes).toEqual(['1 image was left out, as only PNG and JPEG images can be added.', SCRIPT_NOTE, LAYOUT_NOTE]);
    expect(() => prepare('<p> </p>', 'x')).toThrow(EMPTY_WORD);
  });
});

describe('helpers', () => {
  it('builds facts and a title', () => {
    expect(getFacts({ headings: 2, lists: 1, tables: 0, images: 3 }, 4, { size: 2048 }).map(({ value }) => value)).toEqual(['4', '2 KB', '2', '1', '0', '3']);
    expect(titleFrom('My Report.docx')).toBe('My Report');
    expect(titleFrom('.docx')).toBe('Document');
  });
});
