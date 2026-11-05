import { CircleAlert } from 'lucide-react';

export default function CalculatorInput({ id, label, value, onChange, error, inputMode = 'decimal', suffix, ...props }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`block min-h-12 w-full rounded-2xl border-2 bg-white px-4 py-2 text-base font-medium text-ink transition-colors outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint ${
            suffix ? 'pr-10' : ''
          } ${error ? 'border-danger' : 'border-line hover:border-mint'}`}
          {...props}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-ink/80">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
