import { forwardRef } from 'react';
import { ClipboardList } from 'lucide-react';

const ResultPanel = forwardRef(function ResultPanel({ title = 'Your Results', icon: Icon = ClipboardList, summary, emptyText, children }, ref) {
  return (
    <section aria-label={title} className="rounded-3xl bg-card p-4 shadow-card sm:p-6">
      <div className="flex items-center gap-4 rounded-2xl bg-secondary p-3 pr-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-mint/60">
          <Icon aria-hidden="true" className="size-7 text-primary" />
        </span>
        <div className="min-w-0">
          <h2 ref={ref} tabIndex={-1} className="text-xl font-extrabold tracking-tight outline-none sm:text-2xl">
            {title}
          </h2>
          {summary && <p className="mt-0.5 text-sm font-medium text-ink/80">{summary}</p>}
        </div>
      </div>

      {children ?? (
        <div className="px-4 py-12 text-center">
          <p className="font-bold">Your results will appear here</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink/80">{emptyText}</p>
        </div>
      )}
    </section>
  );
});

export default ResultPanel;
