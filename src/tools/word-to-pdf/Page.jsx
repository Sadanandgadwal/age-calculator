import { useState } from 'react';
import { FileText } from 'lucide-react';
import * as content from './content.js';
import { checkWordFile, getFacts, prepare, readWordHtml, renderPdf, titleFrom } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';
import { formatBytes } from '../../utils/imageFile.js';
import { MEMORY_MESSAGE, loadPdf, pdfFilename } from '../../utils/pdfFile.js';

export default function WordToPdfPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const current = result?.file === file ? result : null;

  const choose = (next) => {
    setResult(null);
    const problem = checkWordFile(next);
    setError(problem);
    setFile(problem ? null : next);
  };

  const convert = async () => {
    setStatus('Reading the document…');
    try {
      const html = await readWordHtml(file);
      const { definition, stats, notes } = prepare(html, titleFrom(file.name));
      setStatus('Creating the PDF…');
      const blob = await renderPdf(definition);
      const pdf = await loadPdf(new Uint8Array(await blob.arrayBuffer()));
      setResult({ file, blob, notes, facts: getFacts(stats, pdf.getPageCount(), blob) });
    } catch (failure) {
      setResult({ file, error: failure instanceof RangeError ? MEMORY_MESSAGE : failure.message });
    }
    setStatus(null);
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  return (
    <ToolLayout toolId="word-to-pdf" content={content}>
      <TextToolShell
        formLabel="Choose a Word document"
        onClear={reset}
        panel={{ title: 'Your PDF', icon: FileText, emptyText: 'Choose a .docx file, then select Convert to PDF.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <ul className="mt-4 space-y-2 text-sm">
                {current.notes.map((note) => (
                  <li key={note} className="rounded-xl bg-soft-yellow px-4 py-3 font-medium">{note}</li>
                ))}
              </ul>
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(file.name, 'converted'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="word-file" label="Choose or drop a Word document" hint="A .docx file up to 50 MB. It stays on your device." accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onFile={choose} error={error} />
        {file && (
          <p className="text-sm">
            <span className="font-bold">{file.name}</span>: {formatBytes(file.size)}
          </p>
        )}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={FileText} onClick={convert} disabled={!file || Boolean(status)}>
          Convert to PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
