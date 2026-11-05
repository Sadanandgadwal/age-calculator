import { CircleAlert, Clock } from 'lucide-react';

export default function TimeField({ id, label, value, onChange, error }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <div className="relative mt-2">
        <Clock aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input
          id={id}
          type="time"
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`block min-h-12 w-full appearance-none rounded-2xl border-2 bg-white py-2 pr-3 pl-12 text-base font-medium text-ink transition-colors outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint ${
            error ? 'border-danger' : 'border-line hover:border-mint'
          }`}
        />
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
