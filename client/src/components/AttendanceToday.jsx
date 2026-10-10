import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Users, UserCheck, UserX, RefreshCw, CalendarDays } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Aaj ka live attendance — total aaye, per class, ladke/ladkiyan.
 * Principal (poore school) aur teacher (apni class) dono ke liye.
 */
const AttendanceToday = ({ date: fixedDate }) => {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(fixedDate || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/school/attendance/today?date=${encodeURIComponent(date)}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Attendance could not be loaded');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const total = data?.total ?? 0;
  const present = data?.present ?? 0;
  const absent = data?.absent ?? 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold">
          <CalendarDays size={18} className="text-emerald-400" />
          Live attendance
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
          />
          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl bg-white/5 p-2.5 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary" size={26} />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                <Users size={12} /> Marked
              </p>
              <p className="mt-1 text-2xl font-black">{total}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500">
                <UserCheck size={12} /> Present
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-400">{present}</p>
            </div>
            <div className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-500">
                <UserX size={12} /> Absent
              </p>
              <p className="mt-1 text-2xl font-black text-rose-400">{absent}</p>
            </div>
          </div>

          {data.classes.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-white/5 bg-white/5 px-4 py-8 text-center text-sm text-slate-500">
              {date === new Date().toISOString().split('T')[0]
                ? 'No attendance has been marked yet today.'
                : 'No attendance was marked for this date.'}
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.classes.map((c) => (
                <div key={c.className} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-black">Class {c.className}</p>
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      {c.present}/{c.students} present
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>👧 Girls</span>
                      <b className="text-rose-300">{c.girls}</b>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>👦 Boys</span>
                      <b className="text-sky-300">{c.boys}</b>
                    </div>
                    <div className="text-slate-500">Absent</div>
                    <div className="text-slate-300">{c.absent}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AttendanceToday;