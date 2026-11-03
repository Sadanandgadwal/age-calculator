import { Link } from 'react-router';
import { SearchX } from 'lucide-react';
import ToolGrid from './ToolGrid.jsx';
import { pluralize } from '../../utils/formatResult.js';

/** Search results, with a count for screen readers and a way out when nothing matches. */
export default function ToolResults({ tools, query, onClear, headingLevel }) {
  return (
    <>
      <p role="status" className="mb-4 text-sm font-medium text-ink/80">
        {pluralize(tools.length, 'tool')} found for “{query.trim()}”
      </p>

      {tools.length > 0 ? (
        <ToolGrid tools={tools} headingLevel={headingLevel} />
      ) : (
        <div className="rounded-2xl bg-card px-6 py-12 text-center shadow-card">
          <SearchX aria-hidden="true" className="mx-auto size-10 text-primary" />
          <p className="mt-4 font-bold">No tools match your search</p>
          <p className="mt-1 text-sm text-ink/80">Try a different word, or browse everything we have.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-primary px-5 text-sm font-bold text-white outline-none hover:bg-primary-dark focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
            >
              Clear search
            </button>
            <Link
              to="/all-tools"
              className="inline-flex min-h-11 items-center rounded-xl border-2 border-line bg-white px-5 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint"
            >
              View all tools
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
