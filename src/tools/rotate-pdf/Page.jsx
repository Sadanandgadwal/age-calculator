import { useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import * as content from './content.js';
import { applyTurn, countTurned, getFacts, normalizeAngle } from './logic.js';
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
import { copyPagesTo, loadPdfLib, pdfFilename, savePdf } from '../../utils/pdfFile.js';

const turnButton =
  'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-50';

export default function RotatePdfPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const images = usePdfThumbnails(source?.bytes);
  const [chosen, setChosen] = useState(null);
  const [turns, setTurns] = useState([]);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const pageCount = source?.pageCount ?? 0;
  const selected = chosen ?? new Set(Array.from({ length: pageCount }, (_, index) => index));
  const currentTurns = turns.length === pageCount ? turns : Array(pageCount).fill(0);
  const key = source ? `${source.name}|${currentTurns.join(',')}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const handleFile = async (file) => {
    setChosen(null);
    setTurns([]);
    setResult(null);
    await choose(file);
  };

  const turn = (delta) => setTurns(applyTurn(currentTurns, selected, delta, pageCount));

  const save = async () => {
    setStatus('Saving…');
    try {
      const { degrees } = await loadPdfLib();
      const output = await copyPagesTo(source.document, source.document.getPageIndices());
      output.getPages().forEach((page, index) => page.setRotation(degrees(normalizeAngle(page.getRotation().angle + currentTurns[index]))));
      const blob = await savePdf(output);
      setResult({ key, source, blob, facts: getFacts(currentTurns, blob) });
    } catch (failure) {
      setResult({ key, source, error: failure.message });
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setChosen(null);
    setTurns([]);
    setResult(null);
  };

  return (
    <ToolLayout toolId="rotate-pdf" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and rotate pages"
        onClear={reset}
        panel={{ title: 'Rotated PDF', icon: RotateCw, emptyText: 'Choose a PDF, rotate its pages, then save it.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'rotated'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="rotate-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && (
          <>
            <div role="group" aria-label="Rotate the selected pages" className="flex flex-wrap gap-2">
              <button type="button" className={turnButton} disabled={selected.size === 0} onClick={() => turn(-90)}>
                <RotateCcw aria-hidden="true" className="size-4" />
                Left
              </button>
              <button type="button" className={turnButton} disabled={selected.size === 0} onClick={() => turn(90)}>
                <RotateCw aria-hidden="true" className="size-4" />
                Right
              </button>
              <button type="button" className={turnButton} disabled={selected.size === 0} onClick={() => turn(180)}>
                180°
              </button>
            </div>
            <PageSelector key={source.name + source.size} id="rotate-pages" label="Pages to rotate" pageCount={pageCount} images={images} selected={selected} onChange={setChosen} rotations={currentTurns} />
          </>
        )}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={RotateCw} onClick={save} disabled={!source || countTurned(currentTurns) === 0 || Boolean(status)}>
          Save rotated PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
