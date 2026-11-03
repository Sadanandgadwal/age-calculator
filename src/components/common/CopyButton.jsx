import { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';

const STATUS_TIMEOUT_MS = 3000;

export default function CopyButton({ getText, label = 'Copy results' }) {
  const [status, setStatus] = useState('');
  const timer = useRef(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    let message = 'Results copied to clipboard.';
    try {
      await navigator.clipboard.writeText(getText());
    } catch {
      message = "Couldn't copy. Please select and copy the text manually.";
    }
    setStatus(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), STATUS_TIMEOUT_MS);
  };

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint"
      >
        <Copy aria-hidden="true" className="size-4" />
        {label}
      </button>
      <p role="status" className="mt-2 min-h-5 text-center text-sm font-medium text-primary">
        {status}
      </p>
    </div>
  );
}
