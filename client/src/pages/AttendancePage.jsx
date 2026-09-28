import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Loader2, CalendarDays, Search, UserCheck, Check, RefreshCw, UserPlus } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import AddStudentModal from '../components/AddStudentModal';

const CLASSES = ['9', '10', '11', '12'];
const STAFF = ['teacher', 'principal', 'admin'];

const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

// UTC date se attendance default galat din par set ho sakta tha.
const todayLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const prettyDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value || '');
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const canMark = STAFF.includes(user?.role);
  const ownClass = user?.class && user.class !== 'N/A' ? user.class : null;

  const [className, setClassName] = useState(ownClass || '10');
  const [searchTerm, setSearchTerm] = useState('');
  const [markingList, setMarkingList] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [date, setDate] = useState(todayLocal);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Teacher apni hi class ka attendance mark kar sakta hai.
  const selectableClasses = user?.role === 'teacher' && ownClass ? [ownClass] : CLASSES;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (canMark) {
        const [studentsRes, historyRes] = await Promise.all([
          axios.get(`/api/school/users?role=student&className=${className}`),
          axios.get(`/api/school/attendance?className=${className}`)
        ]);

        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const history = Array.isArray(historyRes.data) ? historyRes.data : [];
        setAttendanceHistory(history);

        const existing = new Map(
          history.filter((h) => String(h.date).slice(0, 10) === date).map((h) => [h.studentId, h.status])
        );

        setMarkingList(
          students.map((s) => ({
            studentId: s.id,
            studentName: s.name,
            status: existing.get(s.id) || 'present'
          }))
        );
      } else {
        const res = await axios.get('/api/school/attendance');
        setAttendanceHistory(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Attendance could not be loaded');
    } finally {
      setLoading(false);
    }
  }, [user, canMark, className, date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = (studentId, status) => {
    setMarkingList((prev) =>
      prev.map((record) => (record.studentId === studentId ? { ...record, status } : record))
    );
  };

  const saveAttendance = async () => {
    if (markingList.length === 0) return;
    setSaving(true);
    const loadingToast = toast.loading('Recording attendance');
    try {
      await axios.post('/api/school/attendance', { date, className, records: markingList });
      toast.success('Attendance recorded', { id: loadingToast });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Attendance could not be saved', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const term = searchTerm.trim().toLowerCase();
  const filteredStudents = useMemo(
    () =>
      markingList.filter(
        (record) =>
          !term ||
          String(record.studentName || '').toLowerCase().includes(term) ||
          String(record.studentId).toLowerCase().includes(term)
      ),
    [markingList, term]
  );

  const presentCount = markingList.filter((r) => r.status === 'present').length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-black sm:gap-4 sm:text-3xl">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary sm:h-14 sm:w-14">
            <Users size={26} />
          </span>
          Attendance
        </h1>

        {canMark && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={label} htmlFor="attendance-class">Class</label>
              <select
                id="attendance-class"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={selectableClasses.length === 1}
                className={`${field} disabled:opacity-70`}
              >
                {selectableClasses.map((klass) => (
                  <option key={klass} value={klass}>Class {klass}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={label} htmlFor="attendance-date">Date</label>
              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={field}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={loadData}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-slate-400 transition-colors hover:bg-white/10 sm:w-auto sm:px-5"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={17} />
                Refresh
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowAdd(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20 sm:w-auto sm:px-5"
              >
                <UserPlus size={17} />
                Add student
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={34} />
        </div>
      ) : (
        <>
          {canMark && (
            <section className="glass-effect mb-8 rounded-3xl border border-white/5 p-5 sm:p-7">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-black">Class {className} · {prettyDate(date)}</h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {presentCount} of {markingList.length} present
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="search"
                      placeholder="Find a student"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${field} pl-11`}
                    />
                  </div>

                  <button
                    onClick={saveAttendance}
                    disabled={saving || markingList.length === 0}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    Save
                  </button>
                </div>
              </div>

              {markingList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
                  <UserCheck className="mx-auto mb-3 text-slate-700" size={40} />
                  <p className="text-sm text-slate-500">No students are registered in class {className}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                  {filteredStudents.map((record) => (
                    <motion.div
                      key={record.studentId}
                      layout
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            record.status === 'present'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          <UserCheck size={20} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{record.studentName}</p>
                          <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                            {String(record.studentId).slice(-6)}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => updateStatus(record.studentId, 'present')}
                          aria-label={`Mark ${record.studentName} present`}
                          className={`rounded-xl p-2.5 transition-colors ${
                            record.status === 'present'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/5 text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => updateStatus(record.studentId, 'absent')}
                          aria-label={`Mark ${record.studentName} absent`}
                          className={`rounded-xl p-2.5 transition-colors ${
                            record.status === 'absent'
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/5 text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CalendarDays className="text-slate-500" size={19} />
              {canMark ? 'Recent records' : 'Your attendance'}
            </h2>

            {attendanceHistory.length === 0 ? (
              <div className="glass-effect rounded-3xl border border-white/5 px-5 py-14 text-center">
                <p className="text-sm text-slate-500">No attendance has been recorded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {attendanceHistory.slice(0, 20).map((row, index) => (
                  <div
                    key={`${row.studentId}-${row.date}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{row.studentName || 'Attendance record'}</p>
                      <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        {prettyDate(row.date)}
                        {row.className && row.className !== 'All' ? ` · Class ${row.className}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase ${
                        row.status === 'present'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <AddStudentModal
        className={className}
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={loadData}
      />
    </div>
  );
};

export default AttendancePage;
