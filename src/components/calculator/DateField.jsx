import { forwardRef } from 'react';
import { CalendarDays, CircleAlert } from 'lucide-react';

/** Labelled native date input. The native control gives every platform a proper date picker. */
const DateField = forwardRef(function DateField(
  { id, label, icon: Icon, value, onChange, error, min, max },
  ref,
) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2.5 text-[15px] font-bold text-ink">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        {label}
      </label>

      <div className="relative mt-3">
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
        />
        <input
          ref={ref}
          id={id}
          name={id}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`block min-h-13 w-full appearance-none rounded-2xl border-2 bg-white py-2.5 pr-3 pl-12 text-base font-medium text-ink transition-colors outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint ${
            error ? 'border-danger' : 'border-line hover:border-mint'
          }`}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default DateField;
