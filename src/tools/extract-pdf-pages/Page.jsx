import { useState } from 'react';
import { FileOutput } from 'lucide-react';
import * as content from './content.js';
import { getFacts, sortedPages } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PageSelector from '../../components/common/PageSelector.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import usePdfFile from '../../hooks/usePdfFile.js';
import usePdfThumbnails from '../../hooks/usePdfThumbnails.js';
import { saveBlob } from '../../utils/download.js';
import { copyPagesTo, pdfFilename, savePdf } from '../../utils/pdfFile.js';

export default function ExtractPdfPagesPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const images = usePdfThumbnails(source?.bytes);
  const [selected, setSelected] = useState(new Set());
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const pages = sortedPages(selected);
  const key = source ? `${source.name}|${pages.join(',')}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const handleFile = async (file) => {
    setSelected(new Set());
    setResult(null);
    await choose(file);
  };

  const extract = async () => {
    setStatus('Extracting…');
    try {
      const blob = await savePdf(await copyPagesTo(source.document, pages));
      setResult({ key, source, blob, facts: getFacts(pages, source.pageCount, blob) });
    } catch (failure) {
      setResult({ key, source, error: failure.message });
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setSelected(new Set());
    setResult(null);
  };

  return (
    <ToolLayout toolId="extract-pdf-pages" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and pages"
        onClear={reset}
        panel={{ title: 'Extracted Pages', icon: FileOutput, emptyText: 'Choose a PDF, then select the pages you want.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'extracted'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="extract-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && <PageSelector key={source.name + source.size} id="extract-pages" label="Pages to extract" pageCount={source.pageCount} images={images} selected={selected} onChange={setSelected} />}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={FileOutput} onClick={extract} disabled={!source || pages.length === 0 || Boolean(status)}>
          Extract pages
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
