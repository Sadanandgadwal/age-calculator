import { Link } from 'react-router';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
      <Compass aria-hidden="true" className="mx-auto size-12 text-primary" />
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Page not found</h1>
      <p className="mt-3 text-lg text-ink/80">The page you're looking for doesn't exist or may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-12 items-center rounded-2xl bg-primary px-6 font-bold text-white outline-none hover:bg-primary-dark focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
        >
          Go to home
        </Link>
        <Link
          to="/all-tools"
          className="inline-flex min-h-12 items-center rounded-2xl border-2 border-line bg-white px-6 font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint"
        >
          View all tools
        </Link>
      </div>
    </main>
  );
}
