import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * React me koi render-time crash (undefined ka .map(), koi missing prop, koi
 * corrupted localStorage value) poore app ko blank safed kar deta tha — user
 * ko sirf ek white screen dikhti thi, aur refresh karne se wahi hota tha jab
 * tak data theek nahi hota. Ye boundary un errors ko pakadti hai aur user ko
 * do kaam deti hai: "dobara try" aur "ghar par jao".
 *
 * Ye `componentDidCatch` + `getDerivedStateFromError` use karti hai, isliye
 * class component zaroori hai (hooks se nahi ho sakti).
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // Server-side log ke liye. Browsers me `console.error` bhi useful hai,
    // isliye dono rakhe hain.
    console.error('[ErrorBoundary]', error, info?.componentStack);
    this.props.onError?.(error, info);
  }

  handleReload = () => {
    // Sirf component state reset karna kaafi nahi hota — agar crash corrupted
    // localStorage se aaya hai to wahi dobara crash karega. Isliye cache saaf
    // karke full reload karte hain.
    try {
      localStorage.removeItem('dj_user');
      sessionStorage.removeItem('dj_user');
    } catch {
      // Private mode me storage likhna band ho sakta hai — ignore.
    }
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ error: null, info: null });
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-5 py-16 text-slate-100">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle size={32} />
          </div>

          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Something went wrong</h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-400 sm:text-base">
            This is not your fault — the page failed to load. Try the button below, and if the
            problem stays, reload the page. None of your data has been deleted.
          </p>

          {/* Show the exact error only in development, not in production. */}
          {import.meta.env.DEV && this.state.error ? (
            <pre className="mb-6 max-h-48 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-left text-xs text-red-300">
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <RefreshCw size={16} />
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
            >
              <Home size={16} />
              Go to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
