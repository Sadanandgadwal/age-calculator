import { Search, X } from 'lucide-react';

export default function ToolSearch({ value, onChange }) {
  return (
    <form role="search" onSubmit={(event) => event.preventDefault()} className="relative mx-auto w-full max-w-xl">
      <label htmlFor="tool-search" className="sr-only">
        Search tools by name or category
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
      />
      <input
        id="tool-search"
        type="text"
        inputMode="search"
        autoComplete="off"
        placeholder="Search tools"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block min-h-13 w-full rounded-2xl border-2 border-line bg-white py-2.5 pr-12 pl-12 text-base font-medium text-ink transition-colors outline-none placeholder:text-muted hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-xl text-muted outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-mint"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      )}
    </form>
  );
}
