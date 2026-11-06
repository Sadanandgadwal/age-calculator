import { useState } from 'react';
import { FileMinus2 } from 'lucide-react';
import * as content from './content.js';
import { checkDeletion, getFacts, remainingPages } from './logic.js';
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

export default function DeletePdfPagesPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const images = usePdfThumbnails(source?.bytes);
  const [selected, setSelected] = useState(new Set());
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const problem = source ? checkDeletion(source.pageCount, selected) : null;
  const key = source ? `${source.name}|${[...selected].sort((a, b) => a - b).join(',')}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const handleFile = async (file) => {
    setSelected(new Set());
    setResult(null);
    await choose(file);
  };

  const remove = async () => {
    setStatus('Deleting pages…');
    const remaining = remainingPages(source.pageCount, selected);
    try {
      const blob = await savePdf(await copyPagesTo(source.document, remaining));
      setResult({ key, source, blob, facts: getFacts(selected, remaining, blob) });
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
    <ToolLayout toolId="delete-pdf-pages" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and pages to delete"
        onClear={reset}
        panel={{ title: 'Updated PDF', icon: FileMinus2, emptyText: 'Choose a PDF, then select the pages to delete.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'edited'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="delete-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && <PageSelector key={source.name + source.size} id="delete-pages" label="Pages to delete" pageCount={source.pageCount} images={images} selected={selected} onChange={setSelected} />}
        {source && selected.size > 0 && problem && <p role="alert" className="text-sm font-medium text-danger">{problem}</p>}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={FileMinus2} onClick={remove} disabled={!source || Boolean(problem) || Boolean(status)}>
          Delete pages
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
