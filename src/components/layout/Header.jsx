import Logo from './Logo.jsx';
import { siteConfig } from '../../config/site.js';

export default function Header() {
  return (
    <header className="px-4 pt-10 pb-8 text-center sm:pt-12 sm:pb-10">
      <div className="flex items-center justify-center gap-3 min-[375px]:gap-4">
        <Logo className="size-11 shrink-0 min-[375px]:size-12 sm:size-16" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight min-[375px]:text-4xl sm:text-5xl">{siteConfig.name}</h1>
          <span aria-hidden="true" className="mx-auto mt-2 block h-1 w-28 rounded-full bg-mint print:hidden" />
        </div>
      </div>
      <p className="mt-4 text-lg text-ink/80 print:hidden">{siteConfig.tagline}</p>
    </header>
  );
}
