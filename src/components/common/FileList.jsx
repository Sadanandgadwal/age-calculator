import { ArrowDown, ArrowUp, X } from 'lucide-react';

const iconButton =
  'grid size-11 print:hidden shrink-0 cursor-pointer place-items-center rounded-xl border-2 border-line bg-white text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-40';

export default function FileList({ label, items, onMove, onRemove }) {
  return (
    <ol aria-label={label} className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-center gap-2 rounded-xl bg-page px-3 py-2">
          <span className="w-6 shrink-0 text-center text-sm font-bold text-ink/80">{index + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold" title={item.name}>{item.name}</span>
            <span className={`block text-xs font-medium ${item.error ? 'text-danger' : 'text-ink/80'}`}>{item.error ?? item.detail}</span>
          </span>
          {onMove && (
            <>
              <button type="button" aria-label={`Move ${item.name} up`} onClick={() => onMove(index, -1)} disabled={index === 0} className={iconButton}>
                <ArrowUp aria-hidden="true" className="size-4" />
              </button>
              <button type="button" aria-label={`Move ${item.name} down`} onClick={() => onMove(index, 1)} disabled={index === items.length - 1} className={iconButton}>
                <ArrowDown aria-hidden="true" className="size-4" />
              </button>
            </>
          )}
          <button type="button" aria-label={`Remove ${item.name}`} onClick={() => onRemove(index)} className={iconButton}>
            <X aria-hidden="true" className="size-4" />
          </button>
        </li>
      ))}
    </ol>
  );
}
