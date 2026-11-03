import { Component } from 'react';

/**
 * Shows a recovery message instead of a blank page. The usual cause is a tool's
 * code failing to download, after a lost connection or a new deployment.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">This page couldn't load</h1>
        <p className="mt-2 text-ink/80">Please check your connection and try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-primary px-5 text-sm font-bold text-white outline-none hover:bg-primary-dark focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
        >
          Reload page
        </button>
      </main>
    );
  }
}
