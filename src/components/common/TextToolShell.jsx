import { CircleAlert, RotateCcw } from 'lucide-react';
import ResultPanel from './ResultPanel.jsx';

const clearButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2';

export function TextField({ id, label, value, onChange, error, rows = 8, className = '', ...props }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        autoComplete="off"
        spellCheck="false"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 block w-full resize-y rounded-2xl border-2 bg-white px-4 py-3 text-base font-medium text-ink transition-colors outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint ${
          error ? 'border-danger' : 'border-line hover:border-mint'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckField({ label, checked, onChange }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 cursor-pointer accent-primary" />
      {label}
    </label>
  );
}

export function TextOutput({ label = 'Output', value, className = '' }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold">{label}</h3>
      <div tabIndex={0} role="region" aria-label={label} className={`mt-1 max-h-80 overflow-auto rounded-xl bg-page px-4 py-3 text-sm font-medium break-words whitespace-pre-wrap outline-none focus-visible:ring-3 focus-visible:ring-mint ${className}`}>
        {value}
      </div>
    </div>
  );
}

export default function TextToolShell({ formLabel, panel, results, onClear, children }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-label={formLabel} className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5">
          {children}
          <button type="button" onClick={onClear} className={clearButton}>
            <RotateCcw aria-hidden="true" className="size-5" />
            Clear
          </button>
        </div>
      </section>

      <ResultPanel {...panel}>{results || undefined}</ResultPanel>
    </div>
  );
}
