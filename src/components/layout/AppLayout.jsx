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
      <BackgroundDecor />
      <SiteNav />
      <div className="flex-1">
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
