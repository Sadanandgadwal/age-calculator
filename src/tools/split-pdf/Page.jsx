import { useState } from 'react';
import { Scissors } from 'lucide-react';
import * as content from './content.js';
import { MODES, describePlan, getFacts, partFilename, planSplit } from './logic.js';
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
import { copyPagesTo, pdfFilename, savePdf } from '../../utils/pdfFile.js';
import { createZip } from '../../utils/zipStore.js';

export default function SplitPdfPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const [modeId, setModeId] = useState(MODES[0].id);
  const [ranges, setRanges] = useState('');
  const [every, setEvery] = useState('1');
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const plan = source ? planSplit(modeId, { ranges, every }, source.pageCount) : null;
  const planKey = plan?.parts ? JSON.stringify(plan.parts) : null;
  const current = result && result.source === source && result.planKey === planKey ? result : null;
  const showError = source && plan?.error && (modeId !== 'ranges' || ranges.trim());

  const split = async () => {
    setStatus('Splitting…');
    try {
      const files = [];
      for (const part of plan.parts) {
        const blob = await savePdf(await copyPagesTo(source.document, part));
        files.push({ name: partFilename(source.name, part), data: new Uint8Array(await blob.arrayBuffer()) });
      }
      const blob = files.length === 1 ? new Blob([files[0].data], { type: 'application/pdf' }) : createZip(files);
      const filename = files.length === 1 ? files[0].name : pdfFilename(source.name, 'split', 'zip');
      setResult({ source, planKey, blob, filename, facts: getFacts(plan.parts, blob) });
    } catch (failure) {
      setResult({ source, planKey, error: failure.message });
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setResult(null);
    setRanges('');
    setEvery('1');
    setModeId(MODES[0].id);
  };

  return (
    <ToolLayout toolId="split-pdf" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and how to split it"
        onClear={reset}
        panel={{ title: 'Split Files', icon: Scissors, emptyText: 'Choose a PDF, then say how to split it.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, current.filename)}>{current.filename.endsWith('.zip') ? 'Download ZIP' : 'Download PDF'}</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="split-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={choose} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && <p className="text-sm font-bold">{source.name}: {source.pageCount} {source.pageCount === 1 ? 'page' : 'pages'}</p>}
        <SegmentedControl label="Split" options={MODES} value={modeId} onChange={setModeId} />
        {modeId === 'ranges' && <CalculatorInput id="split-ranges" label="Ranges, one file each" inputMode="text" placeholder="For example 1-3, 4-6, 7" value={ranges} onChange={setRanges} error={showError ? plan.error : undefined} />}
        {modeId === 'every' && <CalculatorInput id="split-every" label="Pages in each file" inputMode="numeric" value={every} onChange={setEvery} error={showError ? plan.error : undefined} />}
        {plan?.parts && <p className="text-sm font-medium text-ink/80">This makes {describePlan(plan.parts)}.</p>}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={Scissors} onClick={split} disabled={!plan?.parts || Boolean(status)}>
          Split PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
