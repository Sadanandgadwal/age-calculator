import { ArrowRight, Calculator, RotateCcw } from 'lucide-react';

export default function FormActions({ submitLabel = 'Calculate', onReset }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="submit"
        className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-3 rounded-2xl bg-primary px-5 font-bold text-white transition-colors outline-none hover:bg-primary-dark focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
      >
        <Calculator aria-hidden="true" className="size-5" />
        {submitLabel}
        <ArrowRight aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
      >
        <RotateCcw aria-hidden="true" className="size-5" />
        Reset
      </button>
    </div>
  );
}
