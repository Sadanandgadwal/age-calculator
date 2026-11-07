import { useState } from 'react';
import { Lock } from 'lucide-react';
import * as content from './content.js';
import { buildPermissions, checkPasswords, getFacts, isWeak } from './logic.js';
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
import { randomBelow } from '../../utils/secureRandom.js';

const OWNER_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const ownerPassword = () => Array.from({ length: 32 }, () => OWNER_CHARACTERS[randomBelow(OWNER_CHARACTERS.length)]).join('');

export default function ProtectPdfPage() {
  const { source, error, isOpening, choose, clear } = usePdfFile();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isShown, setIsShown] = useState(false);
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);

  const errors = checkPasswords(password, confirmation);
  const isValid = Object.keys(errors).length === 0;
  const settings = { allowPrinting, allowCopying };
  const key = source ? `${source.name}|${allowPrinting}|${allowCopying}|${password.length}|${password === confirmation}` : null;
  const current = result?.key === key && result.source === source ? result : null;

  const handleFile = async (file) => {
    setResult(null);
    await choose(file);
  };

  const protect = async () => {
    setIsTouched(true);
    if (!isValid) return;
    setStatus('Encrypting…');
    try {
      const document = await loadPdf(source.bytes);
      document.encrypt({ userPassword: password, ownerPassword: ownerPassword(), permissions: buildPermissions(settings) });
      const blob = await savePdf(document);
      setResult({ key, source, blob, facts: getFacts(settings, blob) });
    } catch (failure) {
      setResult({ key, source, error: failure.message });
    }
    setStatus(null);
  };

  const reset = () => {
    clear();
    setPassword('');
    setConfirmation('');
    setIsShown(false);
    setAllowPrinting(true);
    setAllowCopying(true);
    setIsTouched(false);
    setResult(null);
  };

  return (
    <ToolLayout toolId="protect-pdf" content={content}>
      <TextToolShell
        formLabel="Choose a PDF and a password"
        onClear={reset}
        panel={{ title: 'Protected PDF', icon: Lock, emptyText: 'Choose a PDF and set a password to lock it.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <p className="mt-3 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">Keep your password safe. It cannot be recovered, so the file cannot be opened without it.</p>
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, pdfFilename(source.name, 'protected'))}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="protect-file" label="Choose or drop a PDF" hint="Up to 100 MB. It stays on your device." accept="application/pdf,.pdf" onFile={handleFile} error={error} />
        {isOpening && <p role="status" className="text-sm font-bold">Opening…</p>}
        <CalculatorInput id="protect-password" label="Password" type={isShown ? 'text' : 'password'} inputMode="text" autoComplete="new-password" value={password} onChange={setPassword} error={isTouched ? errors.password : undefined} />
        <CalculatorInput id="protect-confirm" label="Type the password again" type={isShown ? 'text' : 'password'} inputMode="text" autoComplete="new-password" value={confirmation} onChange={setConfirmation} error={isTouched ? errors.confirmation : undefined} />
        <CheckField label="Show passwords" checked={isShown} onChange={setIsShown} />
        {password.length >= 4 && isWeak(password) && <p className="text-sm font-medium text-ink/80">A longer password, of 10 characters or more, is much harder to guess.</p>}
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-bold">After opening, allow people to</legend>
          <CheckField label="Print" checked={allowPrinting} onChange={setAllowPrinting} />
          <CheckField label="Copy text" checked={allowCopying} onChange={setAllowCopying} />
        </fieldset>
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={Lock} onClick={protect} disabled={!source || Boolean(status)}>
          Protect PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
