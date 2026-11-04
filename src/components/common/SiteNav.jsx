import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X } from 'lucide-react';
import BrandMark from './BrandMark.jsx';
import { siteConfig } from '../../config/site.js';
import { CATEGORIES } from '../../data/toolCategories.js';
import { TOOLS } from '../../data/toolsRegistry.js';
import { getActiveCategories } from '../../utils/toolSearch.js';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/all-tools', label: 'All Tools' },
  ...getActiveCategories(CATEGORIES, TOOLS).map(({ route, name }) => ({ to: route, label: name })),
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }) =>
  `flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-mint ${
    isActive ? 'bg-secondary text-primary' : 'text-ink/80 hover:bg-secondary hover:text-primary'
  }`;

function NavLinks({ onNavigate }) {
  return NAV_LINKS.map(({ to, label, end }) => (
    <li key={to}>
      <NavLink to={to} end={end} className={linkClass} onClick={onNavigate}>
        {label}
      </NavLink>
    </li>
  ));
}

export default function SiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const MenuIcon = isOpen ? X : Menu;

  return (
    <header className="border-b border-line/70 bg-white/80 print:hidden">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex min-h-11 items-center gap-2.5 rounded-xl text-lg font-extrabold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-mint"
        >
          <BrandMark className="size-8" />
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            <NavLinks />
          </ul>
        </nav>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen((open) => !open)}
          className="grid size-11 cursor-pointer place-items-center rounded-xl text-primary outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint lg:hidden"
        >
          <MenuIcon aria-hidden="true" className="size-6" />
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-line/70 px-4 py-2 sm:px-6 lg:hidden">
          <ul className="flex flex-col gap-0.5">
            <NavLinks onNavigate={() => setIsOpen(false)} />
          </ul>
        </nav>
      )}
    </header>
  );
}
