import { Link, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { getPageMeta } from '../../seo/pageMeta.js';

/** Breadcrumb for the current page, using the same trail as its structured data. */
export default function Breadcrumb() {
  const { breadcrumbs } = getPageMeta(useLocation().pathname);

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 print:hidden">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {breadcrumbs.map(({ name, path }, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          return (
            <li key={path} className="flex items-center gap-1">
              {index > 0 && <ChevronRight aria-hidden="true" className="size-4 text-muted" />}
              {isCurrent ? (
                <span aria-current="page" className="font-semibold text-ink">
                  {name}
                </span>
              ) : (
                <Link to={path} className="rounded font-medium text-primary underline-offset-2 hover:underline">
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
