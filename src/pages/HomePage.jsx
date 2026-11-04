import { useState } from 'react';
import { Link } from 'react-router';
import AdSlot from '../components/ads/AdSlot.jsx';
import ToolGrid from '../components/common/ToolGrid.jsx';
import ToolResults from '../components/common/ToolResults.jsx';
import ToolSearch from '../components/common/ToolSearch.jsx';
import { siteConfig } from '../config/site.js';
import { CATEGORIES } from '../data/toolCategories.js';
import { TOOLS } from '../data/toolsRegistry.js';
import { pluralize } from '../utils/formatResult.js';
import { getFeaturedTools, getRecentTools, getToolsInCategory, searchTools } from '../utils/toolSearch.js';

function ToolSection({ id, title, tools }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-5 text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      <ToolGrid tools={tools} />
    </section>
  );
}

function CategoryLinks() {
  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="mb-5 text-2xl font-extrabold tracking-tight">
        Browse by category
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map(({ id, name, route, description, icon: Icon }) => {
          const count = getToolsInCategory(TOOLS, id).length;
          return (
            <li key={id}>
              <Link
                to={route}
                className="flex h-full flex-col rounded-2xl bg-card p-5 shadow-card outline-none hover:ring-2 hover:ring-mint focus-visible:ring-3 focus-visible:ring-mint"
              >
                <Icon aria-hidden="true" className="size-6 text-primary" />
                <span className="mt-3 font-extrabold">{name}</span>
                <span className="mt-1 flex-1 text-sm text-ink/80">{description}</span>
                <span className="mt-3 text-sm font-bold text-primary">
                  {count > 0 ? pluralize(count, 'tool') : 'Tools coming soon'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-10 text-center sm:py-14">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Everyday Tools, All in One Place</h1>
        <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-28 rounded-full bg-mint" />
        <p className="mx-auto mt-4 mb-8 max-w-2xl text-lg text-ink/80">{siteConfig.tagline}</p>
        <ToolSearch value={query} onChange={setQuery} />
      </section>

      {isSearching ? (
        <section aria-label="Search results">
          <ToolResults tools={searchTools(TOOLS, query)} query={query} onClear={() => setQuery('')} headingLevel={2} />
        </section>
      ) : (
        <div className="flex flex-col gap-12">
          <ToolSection id="popular-heading" title="Popular tools" tools={getFeaturedTools(TOOLS)} />
          <AdSlot placement="inContent" />
          <ToolSection id="recent-heading" title="Recently added" tools={getRecentTools(TOOLS)} />
          <CategoryLinks />
        </div>
      )}
    </main>
  );
}
