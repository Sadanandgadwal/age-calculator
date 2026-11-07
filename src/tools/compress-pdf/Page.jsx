import { useState } from 'react';
import { Shrink } from 'lucide-react';
import * as content from './content.js';
import { LEVELS, compressPdf, describeNoSaving, getFacts, getLevel, getOutcome } from './logic.js';
import { recodeJpeg } from './recodeJpeg.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import usePdfFile from '../../hooks/usePdfFile.js';
import { saveBlob } from '../../utils/download.js';
import { formatBytes } from '../../utils/imageFile.js';
import { describePdfError, pdfFilename } from '../../utils/pdfFile.js';

export default function CompressPdfPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const [levelId, setLevelId] = useState('recommended');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const key = source ? `${source.name}|${levelId}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const handleFile = async (file) => {
    setResult(null);
    await choose(file);
  };

  const compress = async () => {
    setStatus('Compressing…');
    try {
      const { output, imageCount, replaced } = await compressPdf(source.bytes, levelId, recodeJpeg, (done, total) => setStatus(`Compressing photo ${done} of ${total}…`));
      const outcome = getOutcome(source.size, output.length);
      setResult(
        outcome.smaller
          ? { key, source, blob: new Blob([output], { type: 'application/pdf' }), facts: getFacts(outcome, imageCount, replaced) }
          : { key, source, notice: describeNoSaving(imageCount) },
      );
    } catch (failure) {
      setResult({ key, source, error: describePdfError(failure.cause ?? failure) });
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setResult(null);
  };

  return (
    <ToolLayout toolId="compress-pdf" content={content}>
      <TextToolShell
        formLabel="Choose a PDF to compress"
        onClear={reset}
        panel={{ title: 'Compressed PDF', icon: Shrink, emptyText: 'Choose a PDF and a level, then select Compress PDF.' }}
        results={
          current &&
          (current.error || current.notice ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error ?? current.notice}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'compressed'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="compress-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && (
          <p className="text-sm">
            <span className="font-bold">{source.name}</span>: {source.pageCount} {source.pageCount === 1 ? 'page' : 'pages'}, {formatBytes(source.size)}
          </p>
        )}
        <SegmentedControl label="Compression level" options={LEVELS} value={levelId} onChange={setLevelId} />
        <p className="text-center text-sm">{getLevel(levelId).hint}</p>
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={Shrink} onClick={compress} disabled={!source || Boolean(status)}>
          Compress PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
