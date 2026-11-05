import { Info } from 'lucide-react';
import FormActions from './FormActions.jsx';
import ResultPanel from './ResultPanel.jsx';

export default function CalculatorShell({ form: { formRef, headingRef, submit }, formLabel, formTitle, note, onReset, panel, results, submitLabel, children }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-label={formLabel} className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        {formTitle && <h2 className="mb-5 text-lg font-extrabold tracking-tight">{formTitle}</h2>}
        <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-5">
          {children}
          <FormActions onReset={onReset} submitLabel={submitLabel} />
        </form>
        {note && (
          <p className="mt-5 flex items-start gap-2 text-sm text-ink/80">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {note}
          </p>
        )}
      </section>

      <ResultPanel ref={headingRef} {...panel}>
        {results || undefined}
      </ResultPanel>
    </div>
  );
}
