import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

/**
 * Pehle unknown path par `<Navigate to="/" replace />` tha, jo user ko silently
 * home page par bhej deta tha. Usse pata hi nahi chalta tha ki link galat tha —
 * koi purana bookmark, koi typo'd URL, ya koi purana screenshot — sab kuch
 * "working" lagta tha jabki actual page exist hi nahi karta.
 *
 * Ab asli 404 page hai, plus role-aware shortcut: agar user pehle se login
 * hai to uske dashboard par seedha button.
 */
export default function NotFoundPage() {
  const location = useLocation();
  const { user } = React.useContext(AuthContext);

  const dashboardPath = user?.role ? `/${String(user.role).toLowerCase()}` : null;
  const attempted = location.pathname + location.search;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-5 py-16 text-white font-sans">
      <div className="w-full max-w-xl text-center">
        <p className="mb-3 text-7xl font-black tracking-tight text-primary/25 sm:text-8xl">404</p>

        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">Ye page nahi mila</h1>
        <p className="mb-2 text-sm leading-relaxed text-slate-400 sm:text-base">
          Jo link aapne khola wo ya to galat type hua, ya wo page hataya gaya hai.
        </p>

        <p className="mb-8 inline-block max-w-full break-all rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400">
          {attempted}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {dashboardPath ? (
            <Link
              to={dashboardPath}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <LayoutDashboard size={16} />
              Mere dashboard par jayein
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Home size={16} />
              Home par jayein
            </Link>
          )}

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
          >
            <ArrowLeft size={16} />
            Wapas jayein
          </button>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="mb-3 text-sm font-semibold text-slate-300">Aap yeh dekh sakte hain</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <Link to="/" className="rounded-xl border border-white/10 px-3 py-2 transition-colors hover:bg-white/5">
              <Search size={13} className="mr-1.5 inline" />Home
            </Link>
            <Link to="/terms" className="rounded-xl border border-white/10 px-3 py-2 transition-colors hover:bg-white/5">
              School rules
            </Link>
            <Link to="/login" className="rounded-xl border border-white/10 px-3 py-2 transition-colors hover:bg-white/5">
              Student sign in
            </Link>
            <Link to="/teacher-login" className="rounded-xl border border-white/10 px-3 py-2 transition-colors hover:bg-white/5">
              Teacher sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
