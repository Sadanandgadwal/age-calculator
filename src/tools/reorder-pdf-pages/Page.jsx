import { useState } from 'react';
import { ArrowDownUp, ListOrdered, Undo2 } from 'lucide-react';
import * as content from './content.js';
import { getFacts, initialOrder, isChanged, moveTo } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PdfPageGrid from '../../components/common/PdfPageGrid.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import usePdfFile from '../../hooks/usePdfFile.js';
import usePdfThumbnails from '../../hooks/usePdfThumbnails.js';
import { saveBlob } from '../../utils/download.js';
import { moveItem } from '../../utils/moveItem.js';
import { copyPagesTo, pdfFilename, savePdf } from '../../utils/pdfFile.js';

const smallButton =
  'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function ReorderPdfPagesPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const images = usePdfThumbnails(source?.bytes);
  const [order, setOrder] = useState([]);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const pageCount = source?.pageCount ?? 0;
  const currentOrder = order.length === pageCount ? order : initialOrder(pageCount);
  const key = source ? `${source.name}|${currentOrder.join(',')}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const handleFile = async (file) => {
    setOrder([]);
    setResult(null);
    await choose(file);
  };

  const save = async () => {
    setStatus('Saving…');
    try {
      const blob = await savePdf(await copyPagesTo(source.document, currentOrder));
      setResult({ key, source, blob, facts: getFacts(currentOrder, blob) });
    } catch (failure) {
      setResult({ key, source, error: failure.message });
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setOrder([]);
    setResult(null);
  };

  return (
    <ToolLayout toolId="reorder-pdf-pages" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and set the page order"
        onClear={reset}
        panel={{ title: 'Reordered PDF', icon: ListOrdered, emptyText: 'Choose a PDF, put its pages in order, then save it.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'reordered'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="reorder-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && (
          <>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={smallButton} onClick={() => setOrder([...currentOrder].reverse())}>
                <ArrowDownUp aria-hidden="true" className="size-4" />
                Reverse order
              </button>
              <button type="button" className={smallButton} onClick={() => setOrder(initialOrder(pageCount))}>
                <Undo2 aria-hidden="true" className="size-4" />
                Original order
              </button>
            </div>
            <p className="text-sm font-medium text-ink/80">Drag the pages, or use the arrow buttons under each one.</p>
            <PdfPageGrid label="Page order" pageCount={pageCount} images={images} order={currentOrder} onMove={(position, delta) => setOrder(moveItem(currentOrder, position, delta))} onMoveTo={(from, to) => setOrder(moveTo(currentOrder, from, to))} />
          </>
        )}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={ListOrdered} onClick={save} disabled={!source || !isChanged(currentOrder) || Boolean(status)}>
          Save new order
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
