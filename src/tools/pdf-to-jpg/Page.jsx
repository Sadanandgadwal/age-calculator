import { useState } from 'react';
import { Images } from 'lucide-react';
import * as content from './content.js';
import { RESOLUTIONS, choosePages, getFacts, imageName, scaleFor } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import usePdfFile from '../../hooks/usePdfFile.js';
import { saveBlob } from '../../utils/download.js';
import { encodeCanvas } from '../../utils/imageFile.js';
import { pdfFilename } from '../../utils/pdfFile.js';
import { closeRendering, openForRendering, renderPage } from '../../utils/pdfRender.js';
import { createZip } from '../../utils/zipStore.js';

export default function PdfToJpgPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const [resolutionId, setResolutionId] = useState('150');
  const [pagesText, setPagesText] = useState('');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const choice = source ? choosePages(pagesText, source.pageCount) : null;
  const dpi = RESOLUTIONS.find((item) => item.id === resolutionId).dpi;
  const key = source && choice?.pages ? `${source.name}|${dpi}|${choice.pages.join(',')}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const convert = async () => {
    let pdf;
    try {
      pdf = await openForRendering(source.bytes);
      const files = [];
      for (const [position, pageIndex] of choice.pages.entries()) {
        setStatus(`Converting page ${position + 1} of ${choice.pages.length}…`);
        const page = await pdf.getPage(pageIndex + 1);
        const { width, height } = page.getViewport({ scale: 1 });
        const canvas = await renderPage(pdf, pageIndex + 1, { scale: scaleFor(dpi, width, height) });
        const blob = await encodeCanvas(canvas, 'image/jpeg', 0.9);
        files.push({ name: imageName(source.name, pageIndex), data: new Uint8Array(await blob.arrayBuffer()) });
        canvas.width = 0;
      }
      const isZip = files.length > 1;
      const blob = isZip ? createZip(files) : new Blob([files[0].data], { type: 'image/jpeg' });
      setResult({ key, source, blob, filename: isZip ? pdfFilename(source.name, 'images', 'zip') : files[0].name, isZip, facts: getFacts(choice.pages, dpi, blob, isZip) });
    } catch (failure) {
      setResult({ key, source, error: failure.message });
    } finally {
      closeRendering(pdf);
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setPagesText('');
    setResolutionId('150');
    setResult(null);
  };

  return (
    <ToolLayout toolId="pdf-to-jpg" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and options"
        onClear={reset}
        panel={{ title: 'JPG Images', icon: Images, emptyText: 'Choose a PDF to turn its pages into images.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, current.filename)}>{current.isZip ? 'Download ZIP' : 'Download JPG'}</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="jpg-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={choose} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && <p className="text-sm font-bold">{source.name}: {source.pageCount} {source.pageCount === 1 ? 'page' : 'pages'}</p>}
        <SegmentedControl label="Resolution" options={RESOLUTIONS} value={resolutionId} onChange={setResolutionId} />
        <CalculatorInput id="jpg-pages" label="Pages (leave empty for all)" inputMode="text" placeholder="For example 1-3, 5" value={pagesText} onChange={setPagesText} error={source ? choice?.error : undefined} />
        {choice?.isLimited && <p className="text-sm font-medium text-ink/80">Only the first 200 pages are converted at a time. Type a range to convert others.</p>}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={Images} onClick={convert} disabled={!choice?.pages || Boolean(status)}>
          Convert to JPG
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
