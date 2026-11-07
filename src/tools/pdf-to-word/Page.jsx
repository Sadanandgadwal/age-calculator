import { useState } from 'react';
import { FileType } from 'lucide-react';
import * as content from './content.js';
import { LAYOUT_NOTE, NO_TEXT, bodySizeOf, buildDocx, getFacts, summarize, toLines, toParagraphs } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import usePdfFile from '../../hooks/usePdfFile.js';
import { saveBlob } from '../../utils/download.js';
import { formatBytes } from '../../utils/imageFile.js';
import { MEMORY_MESSAGE, pdfFilename } from '../../utils/pdfFile.js';
import { closeRendering, openForRendering, readPageText } from '../../utils/pdfRender.js';

export default function PdfToWordPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const current = result?.source === source ? result : null;

  const handleFile = async (file) => {
    setResult(null);
    await choose(file);
  };

  const convert = async () => {
    setStatus('Reading the text…');
    let pdf = null;
    try {
      pdf = await openForRendering(source.bytes);
      const lines = [];
      for (let number = 1; number <= pdf.numPages; number += 1) {
        setStatus(`Reading page ${number} of ${pdf.numPages}…`);
        lines.push(toLines(await readPageText(pdf, number)));
      }
      const bodySize = bodySizeOf(lines);
      const pages = lines.map((page) => toParagraphs(page, bodySize));
      const summary = summarize(pages);
      if (summary.words === 0) {
        setResult({ source, error: NO_TEXT });
      } else {
        setStatus('Creating the Word file…');
        const blob = await buildDocx(pages, source.name.replace(/\.[^.]*$/, ''));
        setResult({ source, blob, facts: getFacts(summary, blob) });
      }
    } catch (failure) {
      setResult({ source, error: failure instanceof RangeError ? MEMORY_MESSAGE : failure.message });
    } finally {
      closeRendering(pdf);
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setResult(null);
  };

  return (
    <ToolLayout toolId="pdf-to-word" content={content}>
      <TextToolShell
        formLabel="Choose a PDF to convert"
        onClear={reset}
        panel={{ title: 'Your Word File', icon: FileType, emptyText: 'Choose a PDF, then select Convert to Word.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{LAYOUT_NOTE}</p>
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'converted', 'docx'))}>Download Word file</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="word-pdf-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && (
          <p className="text-sm">
            <span className="font-bold">{source.name}</span>: {source.pageCount} {source.pageCount === 1 ? 'page' : 'pages'}, {formatBytes(source.size)}
          </p>
        )}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={FileType} onClick={convert} disabled={!source || Boolean(status)}>
          Convert to Word
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
