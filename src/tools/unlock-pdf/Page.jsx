import { useState } from 'react';
import { LockOpen } from 'lucide-react';
import * as content from './content.js';
import { describeSource, getFacts } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import TextToolShell, { CheckField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import usePdfFile from '../../hooks/usePdfFile.js';
import { saveBlob } from '../../utils/download.js';
import { loadPdf, pdfFilename, savePdf } from '../../utils/pdfFile.js';

const PROBE = { ignoreEncryption: true };

export default function UnlockPdfPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile(PROBE);
  const [password, setPassword] = useState('');
  const [isShown, setIsShown] = useState(false);
  const [passwordError, setPasswordError] = useState();
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const isLocked = Boolean(source?.document.isEncrypted);
  const current = result?.source === source ? result : null;

  const handleFile = async (file) => {
    setResult(null);
    setPassword('');
    setPasswordError(undefined);
    await choose(file);
  };

  const unlock = async () => {
    if (!password) {
      setPasswordError('Please enter the password for this PDF.');
      return;
    }
    setStatus('Unlocking…');
    setPasswordError(undefined);
    try {
      const document = await loadPdf(source.bytes, { password });
      const blob = await savePdf(document);
      setResult({ source, blob, facts: getFacts(document.getPageCount(), blob) });
      setPassword('');
    } catch (failure) {
      setPasswordError(failure.message);
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setPassword('');
    setIsShown(false);
    setPasswordError(undefined);
    setResult(null);
  };

  return (
    <ToolLayout toolId="unlock-pdf" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and enter its password"
        onClear={reset}
        panel={{ title: 'Unlocked PDF', icon: LockOpen, emptyText: 'Choose a protected PDF and enter its password.' }}
        results={
          current && (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'unlocked'))}>Download PDF</DownloadButton>
              </div>
            </div>
          )
        }
      >
        <FileDropZone id="unlock-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        {source && !isLocked && <p role="alert" className="rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">This PDF has no password, so there is nothing to remove.</p>}
        {source && isLocked && <p className="text-sm font-bold">{describeSource(source)}</p>}
        <CalculatorInput id="unlock-password" label="Password" type={isShown ? 'text' : 'password'} inputMode="text" autoComplete="off" value={password} onChange={setPassword} error={passwordError} disabled={!isLocked} />
        <CheckField label="Show password" checked={isShown} onChange={setIsShown} />
        <p className="text-sm text-ink/80">Use the password you were given, either the one to open the file or the owner password. Passwords are never guessed.</p>
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={LockOpen} onClick={unlock} disabled={!isLocked || Boolean(status)}>
          Unlock PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
