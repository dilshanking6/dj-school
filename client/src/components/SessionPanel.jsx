import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, RefreshCw, GraduationCap, CalendarClock, ArrowUpRight, UserCheck, UserX
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Academic session panel — principal aur admin ke liye.
 * Dikhata hai: abhi kaunse session me hain, kitne active/passed-out students
 * hain, class-wise ladke/ladkiyan, aur promotion chalane par kya hoga.
 */
const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';

const SessionPanel = ({ onChanged }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/school/session');
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Session info could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const promote = async () => {
    const preview = data?.preview || {};
    const ok = window.confirm(
      `Start session ${preview.session}?\n\n` +
      `${preview.promote || 0} students will move up one class, and ` +
      `${preview.passOut || 0} (Class 12) will be marked passed out.\n\n` +
      `Passed-out records are kept — nothing is deleted.`
    );
    if (!ok) return;

    setPromoting(true);
    const loadingToast = toast.loading('Promoting students');
    try {
      const res = await axios.post('/api/school/session/promote', { confirm: true });
      toast.success(
        `Session ${res.data.session}: ${res.data.promoted} promoted, ${res.data.passedOut} passed out`,
        { id: loadingToast }
      );
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Promotion failed', { id: loadingToast });
    } finally {
      setPromoting(false);
    }
  };

  const breakdown = data?.classBreakdown || {};
  const classKeys = Object.keys(breakdown).sort((a, b) => a.localeCompare(b));
  const preview = data?.preview || {};
  const byClass = preview.byClass || {};

  return (
    <section className={card}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold">
          <CalendarClock size={18} className="text-primary" />
          Academic session
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl bg-white/5 p-2.5 text-slate-400 transition-colors hover:bg-white/10 disabled:opacity-50"
          aria-label="Refresh session"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={26} />
        </div>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                <GraduationCap size={12} /> Session
              </p>
              <p className="mt-1 text-2xl font-black text-primary">{data.currentSession}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500">
                <UserCheck size={12} /> Active
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-400">{data.activeStudents}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                <UserX size={12} /> Passed out
              </p>
              <p className="mt-1 text-2xl font-black text-slate-300">{data.passedOut}</p>
            </div>
          </div>

          {classKeys.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Class</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                    <th className="px-4 py-2.5 text-right">Boys</th>
                    <th className="px-4 py-2.5 text-right">Girls</th>
                  </tr>
                </thead>
                <tbody>
                  {classKeys.map((cls) => (
                    <tr key={cls} className="border-t border-white/5">
                      <td className="px-4 py-2.5 font-bold">Class {cls}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-primary">{breakdown[cls].total}</td>
                      <td className="px-4 py-2.5 text-right text-sky-300">{breakdown[cls].boys}</td>
                      <td className="px-4 py-2.5 text-right text-rose-300">{breakdown[cls].girls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4">
            {data.pending ? (
              <>
                <p className="flex items-center gap-2 text-sm font-bold">
                  <ArrowUpRight size={16} className="text-amber-400" />
                  Promotion ready — session {preview.session}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  <b className="text-emerald-400">{preview.promote}</b> students move up one class,{' '}
                  <b className="text-rose-300">{preview.passOut}</b> Class 12 students will be marked passed out
                  (records kept, login closed).
                </p>
                {Object.keys(byClass).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.keys(byClass).sort((a, b) => a.localeCompare(b)).map((cls) => (
                      <span key={cls} className="rounded-lg bg-black/20 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                        Class {cls} → {byClass[cls].to} · {byClass[cls].total}
                      </span>
                    ))}
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={promote}
                  disabled={promoting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:w-auto"
                >
                  {promoting ? <Loader2 className="animate-spin" size={17} /> : <ArrowUpRight size={17} />}
                  Promote to {preview.session}
                </motion.button>
              </>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <GraduationCap size={16} className="text-emerald-400" />
                All active students are already on session {data.currentSession}. Promotion will unlock after 1 April.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default SessionPanel;
