import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import BackgroundDecor from './BackgroundDecor.jsx';
import Footer from './Footer.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import SiteNav from '../common/SiteNav.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function AppLayout() {
  const { pathname } = useLocation();

  usePageMeta(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only rounded-xl bg-primary px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-mint print:hidden"
      >
        Skip to content
      </a>
      <BackgroundDecor />
      <SiteNav />
      <div id="content" tabIndex={-1} className="flex-1 outline-none">
        {/* The key clears a loading error once the user moves to another page. */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<p className="py-20 text-center text-ink/80">Loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}
