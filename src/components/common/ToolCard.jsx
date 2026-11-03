import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { getCategory } from '../../data/toolCategories.js';

/** A tool in a listing. The link stretches over the card, so all of it is clickable. */
export default function ToolCard({ tool, headingLevel = 3 }) {
  const { name, description, route, categories, icon: Icon } = tool;
  const Heading = `h${headingLevel}`;

  return (
    <article className="relative flex h-full flex-col rounded-2xl bg-card p-6 shadow-card transition-shadow focus-within:ring-3 focus-within:ring-mint hover:ring-2 hover:ring-mint">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary">
          <Icon aria-hidden="true" className="size-6 text-primary" />
        </span>
        <span className="rounded-full bg-page px-3 py-1 text-xs font-semibold text-ink/80">
          {getCategory(categories[0])?.name}
        </span>
      </div>

      <Heading className="mt-4 text-lg font-extrabold tracking-tight">{name}</Heading>
      <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-ink/80">{description}</p>

      <Link
        to={route}
        aria-label={`Open Tool: ${name}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
      >
        Open Tool
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}
