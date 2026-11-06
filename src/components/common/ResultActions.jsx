import { useEffect, useRef, useState } from 'react';
import { Copy, Printer, Share2 } from 'lucide-react';
import PrintReportHost from './PrintReport.jsx';

const STATUS_TIMEOUT_MS = 3000;
const button =
  'inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ResultActions({ getText, getReport, copyOnly = false, printOnly = false }) {
  const [status, setStatus] = useState('');
  const timer = useRef(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showStatus = (message) => {
    setStatus(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), STATUS_TIMEOUT_MS);
  };

  const copy = async () => {
    const copied = await copyText(getText());
    showStatus(copied ? 'Results copied to clipboard.' : "Couldn't copy. Please select and copy the text manually.");
  };

  const share = async () => {
    const text = getText();
    const url = window.location.href;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: document.title, text, url });
      } catch (error) {
        if (error.name !== 'AbortError') showStatus("Couldn't share. Please try copying instead.");
      }
      return;
    }

    const copied = await copyText(`${text}\n${url}`);
    showStatus(copied ? "Sharing isn't available in this browser, so the results were copied instead." : "Sharing isn't available in this browser.");
  };

  return (
    <div className="mt-5 print:hidden">
      {getReport && <PrintReportHost getReport={getReport} />}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {!printOnly && (
          <button type="button" onClick={copy} className={`${button} col-span-2 ${copyOnly ? 'sm:col-span-3' : 'sm:col-span-1'}`}>
            <Copy aria-hidden="true" className="size-4" />
            Copy results
          </button>
        )}
        {!copyOnly && !printOnly && (
          <button type="button" onClick={share} className={button}>
            <Share2 aria-hidden="true" className="size-4" />
            Share
          </button>
        )}
        {!copyOnly && (
          <button type="button" onClick={() => window.print()} className={`${button} ${printOnly ? 'col-span-2 sm:col-span-3' : ''}`}>
            <Printer aria-hidden="true" className="size-4" />
            Print
          </button>
        )}
      </div>
      <p role="status" className="mt-2 min-h-5 text-center text-sm font-medium text-primary">
        {status}
      </p>
    </div>
  );
}
