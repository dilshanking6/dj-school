import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Loader2, RefreshCw, Search, TrendingDown, CalendarDays, Users, Percent
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Attendance report — "kis bache ki kitni attendance".
 * Principal/admin poora school, teacher sirf apni class (server enforce karta hai).
 * Class aur date range se filter hota hai; har student ka marked/present/absent/%.
 */
const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';
const field = 'rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors focus:border-primary/50 [color-scheme:dark]';
const CLASSES = ['9', '10', '11', '12'];

const percentTone = (value) => {
  if (value === null || value === undefined) return 'text-slate-500';
  if (value >= 75) return 'text-emerald-400';
  if (value >= 50) return 'text-amber-400';
  return 'text-rose-400';
};

const barTone = (value) => {
  if (value === null || value === undefined) return 'bg-slate-600';
  if (value >= 75) return 'bg-emerald-500';
  if (value >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};

const AttendanceReport = () => {
  const [className, setClassName] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (className && className !== 'All') params.set('className', className);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await axios.get(`/api/school/attendance/report?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Report could not be loaded');
    } finally {
      setLoading(false);
    }
  }, [className, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const term = search.trim().toLowerCase();
  const students = (data?.students || []).filter(
    (s) => !term || String(s.name || '').toLowerCase().includes(term)
  );

  const cards = [
    { label: 'Students', value: summary.students ?? 0, icon: Users, tone: 'text-primary' },
    { label: 'With records', value: summary.withAttendance ?? 0, icon: ClipboardList, tone: 'text-accent' },
    { label: 'Average', value: summary.averagePercent == null ? '—' : `${summary.averagePercent}%`, icon: Percent, tone: 'text-emerald-400' },
    { label: 'Below 75%', value: summary.lowAttendance ?? 0, icon: TrendingDown, tone: 'text-rose-400' }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-black sm:mb-8 sm:text-3xl">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <ClipboardList size={24} />
        </span>
        Attendance report
      </h1>

      <section className={`${card} mb-5 lg:mb-6`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500" htmlFor="report-class">Class</label>
            <select id="report-class" value={className} onChange={(e) => setClassName(e.target.value)} className={`${field} w-full`}>
              <option value="All">All classes</option>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500" htmlFor="report-from">From</label>
            <input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500" htmlFor="report-to">To</label>
            <input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${field} w-full`} />
          </div>
          <div className="flex items-end">
            <button
              onClick={load}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-slate-400 transition-colors hover:bg-white/10"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              <Icon size={14} className={tone} />
              {label}
            </div>
            <p className={`text-3xl font-black sm:text-4xl ${tone}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <section className={`${card} mt-5 lg:mt-6`}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <CalendarDays size={18} className="text-primary" />
            {className === 'All' ? 'All classes' : `Class ${className}`}
            {(from || to) && (
              <span className="text-xs font-normal text-slate-500">
                ({from || 'start'} → {to || 'today'})
              </span>
            )}
          </h2>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="search"
              placeholder="Find a student"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${field} w-full pl-11`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={26} />
          </div>
        ) : students.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center text-sm text-slate-500">
            No students match this filter.
          </p>
        ) : (
          <div className="space-y-2.5">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-black">
                    {String(s.className)}{s.section && s.section !== 'A' ? s.section : ''}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{s.name}</p>
                    <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      {s.marked} marked · {s.present} present · {s.absent} absent
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:w-64">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barTone(s.percent)}`}
                      style={{ width: `${s.percent == null ? 0 : Math.min(s.percent, 100)}%` }}
                    />
                  </div>
                  <span className={`w-14 shrink-0 text-right text-lg font-black ${percentTone(s.percent)}`}>
                    {s.percent == null ? '—' : `${s.percent}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AttendanceReport;
