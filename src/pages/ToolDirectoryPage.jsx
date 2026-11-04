import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import AdSlot from '../components/ads/AdSlot.jsx';
import Breadcrumb from '../components/common/Breadcrumb.jsx';
import ToolGrid from '../components/common/ToolGrid.jsx';
import ToolResults from '../components/common/ToolResults.jsx';
import ToolSearch from '../components/common/ToolSearch.jsx';
import { CATEGORIES } from '../data/toolCategories.js';
import { TOOLS } from '../data/toolsRegistry.js';
import { getActiveCategories, getToolsInCategory, searchTools } from '../utils/toolSearch.js';

const FILTERS = [
  { to: '/all-tools', label: 'All Tools' },
  ...getActiveCategories(CATEGORIES, TOOLS).map(({ route, name }) => ({ to: route, label: name })),
];

const filterClass = ({ isActive }) =>
  `inline-flex min-h-11 items-center rounded-full border-2 px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-mint ${
    isActive ? 'border-primary bg-primary text-white' : 'border-line bg-white text-primary hover:border-mint hover:bg-secondary'
  }`;

/** Lists all tools, or one category's tools when `category` is given. */
export default function ToolDirectoryPage({ category }) {
  const [query, setQuery] = useState('');
  const tools = category ? getToolsInCategory(TOOLS, category.id) : TOOLS;
  const isSearching = query.trim().length > 0;

  return (
    <main>
      <Breadcrumb />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-8 text-center sm:py-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{category?.name ?? 'All Tools'}</h1>
          <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-28 rounded-full bg-mint" />
          <p className="mx-auto mt-4 mb-8 max-w-2xl text-lg text-ink/80">
            {category?.description ?? 'Browse every free tool, or search by name or category.'}
          </p>
          <ToolSearch value={query} onChange={setQuery} />
        </div>

        <nav aria-label="Filter by category" className="mb-8">
          <ul className="flex flex-wrap justify-center gap-2">
            {FILTERS.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={filterClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {isSearching ? (
          <ToolResults tools={searchTools(tools, query)} query={query} onClear={() => setQuery('')} headingLevel={2} />
        ) : tools.length > 0 ? (
          <ToolGrid tools={tools} headingLevel={2} />
        ) : (
          <div className="rounded-2xl bg-card px-6 py-12 text-center shadow-card">
            <p className="font-bold">No tools here yet</p>
            <p className="mt-1 text-sm text-ink/80">We're working on tools for this category.</p>
            <Link
              to="/all-tools"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white outline-none hover:bg-primary-dark focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
            >
              View all tools
            </Link>
          </div>
        )}

        {!isSearching && tools.length > 0 && <AdSlot placement="footer" className="mt-12" />}
      </div>
    </main>
  );
}
