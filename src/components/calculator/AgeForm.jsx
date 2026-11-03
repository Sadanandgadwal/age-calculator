import { useRef } from 'react';
import { ArrowRight, CalendarCheck, Calculator, RotateCcw, UserRound } from 'lucide-react';
import DateField from './DateField.jsx';
import { MAX_DATE, MIN_DATE, getTodayIso } from '../../utils/date.js';

export default function AgeForm({ dob, asOf, errors, onDobChange, onAsOfChange, onCalculate, onReset }) {
  const dobRef = useRef(null);
  const asOfRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Browsers report a partly typed date as an empty value, with badInput set.
    const nextErrors = onCalculate({
      dobIncomplete: Boolean(dobRef.current?.validity.badInput),
      asOfIncomplete: Boolean(asOfRef.current?.validity.badInput),
    });

    if (nextErrors.dob) dobRef.current?.focus();
    else if (nextErrors.asOf) asOfRef.current?.focus();
  };

  const handleReset = () => {
    // Native reset also clears any partly typed date, which React state can't see.
    dobRef.current?.form?.reset();
    onReset();
    dobRef.current?.focus();
  };

  return (
    <section
      aria-label="Enter your dates"
      className="rounded-3xl bg-card p-6 shadow-card sm:p-8 print:hidden"
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-7">
        <DateField
          ref={dobRef}
          id="dob"
          label="Date of Birth"
          icon={UserRound}
          value={dob}
          onChange={onDobChange}
          error={errors.dob}
          min={MIN_DATE}
          max={getTodayIso()}
        />

        <DateField
          ref={asOfRef}
          id="asOf"
          label="Calculate Age As Of"
          icon={CalendarCheck}
          value={asOf}
          onChange={onAsOfChange}
          error={errors.asOf}
          min={dob || MIN_DATE}
          max={MAX_DATE}
        />

        <div className="mt-2 flex flex-col gap-3">
          <button
            type="submit"
            className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-primary px-5 font-bold text-white transition-colors outline-none hover:bg-primary-dark focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
          >
            <Calculator aria-hidden="true" className="size-5" />
            Calculate Age
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
          >
            <RotateCcw aria-hidden="true" className="size-5" />
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
