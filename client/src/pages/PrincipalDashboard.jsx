import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, HelpCircle, UserCheck, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import StudyHubCard from '../components/StudyHubCard';
import AttendanceToday from '../components/AttendanceToday';
import SessionPanel from '../components/SessionPanel';
import OfficeCreateUser from '../components/OfficeCreateUser';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatPage = lazy(() => import('./ChatPage'));
const PrincipalComplaints = lazy(() => import('./PrincipalComplaints'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const AttendancePage = lazy(() => import('./AttendancePage'));
const AttendanceReport = lazy(() => import('./AttendanceReport'));
const ResultsPage = lazy(() => import('./ResultsPage'));
const EventsPage = lazy(() => import('./EventsPage'));
const StudyContentManager = lazy(() => import('./StudyContentManager'));

const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';
const PageLoader = () => (
  <div className="flex min-h-[50dvh] items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={30} />
  </div>
);

const PrincipalHome = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = async () => {
    try {
      const res = await axios.get('/api/school/users?role=teacher');
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Teachers could not be loaded');
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await axios.get('/api/school/dashboard');
      setDashboard(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Overview could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
      loadTeachers();
    }
  }, [user?.id]);

  const updateUser = async (id, body, message) => {
    try {
      await axios.patch(`/api/school/users/${id}`, body);
      toast.success(message);
      await Promise.all([loadDashboard(), loadTeachers()]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const pendingTeachers = teachers.filter((t) => t.status === 'pending');

  const principal = dashboard?.principal || {};

  const stats = [
    { label: 'Students', value: principal.students ?? 0, hint: 'Enrolled and active', icon: Users, tone: 'text-primary' },
    { label: 'Teaching staff', value: principal.teachers ?? 0, hint: 'Active teachers', icon: BookOpen, tone: 'text-accent' },
    { label: 'Open complaints', value: principal.pendingComplaints ?? 0, hint: 'Awaiting response', icon: HelpCircle, tone: 'text-rose-400' },
    { label: 'Attendance today', value: principal.attendanceMarkedToday ?? 0, hint: 'Registers marked', icon: UserCheck, tone: 'text-emerald-400' },
    { label: 'Passed out', value: principal.passedOut ?? 0, hint: `Session ${principal.session || '—'}`, icon: GraduationCap, tone: 'text-slate-300' }
  ];

  const classAverages = dashboard?.stats?.classAverages || {};
  const hasAverages = Object.keys(classAverages).length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-black sm:mb-8 sm:text-3xl">
        School office, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
      </h1>

      <StudyHubCard className="mb-6 sm:mb-8" />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={30} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(({ label, value, hint, icon: Icon, tone }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  <Icon size={14} className={tone} />
                  {label}
                </div>
                <p className={`text-3xl font-black sm:text-4xl ${tone}`}>{value}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{hint}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 lg:mt-6">
            <SessionPanel onChanged={loadDashboard} />
          </div>

          <section className={`${card} mt-5 lg:mt-6`}>
            <h2 className="mb-5 font-bold">Class performance</h2>
            {!hasAverages ? (
              <p className="text-sm text-slate-500">Class averages appear once results have been published.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(classAverages)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([cls, avg]) => (
                    <div key={cls}>
                      <div className="mb-2 flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Class {cls}</span>
                        <span className="text-primary">{avg}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(avg, 100)}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          <section className={`${card} mt-5 lg:mt-6`}>
            <AttendanceToday />
          </section>

          <section className={`${card} mt-5 lg:mt-6`}>
            <h2 className="mb-5 flex items-center gap-2 font-bold">
              <ShieldCheck size={18} className="text-primary" />
              School management
            </h2>

            <div className="mb-6">
              <OfficeCreateUser role="principal" onCreated={() => Promise.all([loadDashboard(), loadTeachers()])} />
            </div>

            {pendingTeachers.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
                  Awaiting approval
                </p>
                <div className="space-y-2.5">
                  {pendingTeachers.map((t) => (
                    <article key={t.id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-bold">{t.name}</p>
                        <p className="truncate text-xs text-slate-500">{t.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <TeacherClassSelect teacher={t} onChange={(teacher, cls) => updateUser(teacher.id, { className: cls }, 'Class assigned')} />
                        <button
                          onClick={() => updateUser(t.id, { status: 'active' }, 'Teacher approved')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white"
                        >
                          <UserCheck size={15} /> Approve
                        </button>
                        <button
                          onClick={() => updateUser(t.id, { status: 'banned' }, 'Application rejected')}
                          className="rounded-lg bg-rose-500/10 px-3 py-2.5 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500 hover:text-white"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Teaching staff ({teachers.length})
            </p>
            {teachers.length === 0 ? (
              <p className="text-sm text-slate-500">No teachers yet. Create one above.</p>
            ) : (
              <div className="space-y-2.5">
                {teachers.map((t) => (
                  <article key={t.id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{t.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {t.subject || 'Subject'} · {t.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TeacherClassSelect teacher={t} onChange={(teacher, cls) => updateUser(teacher.id, { className: cls }, 'Class assigned')} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

const TeacherClassSelect = ({ teacher, onChange }) => (
  <select
    value={['9', '10', '11', '12'].includes(teacher.class) ? teacher.class : '9'}
    onChange={(e) => onChange(teacher, e.target.value)}
    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50 [color-scheme:dark]"
    aria-label={`Class for ${teacher.name}`}
  >
    {['9', '10', '11', '12'].map((c) => <option key={c} value={c}>Class {c}</option>)}
  </select>
);

const PrincipalDashboard = () => (
  <DashboardShell role="principal">
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<PrincipalHome />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/complaints" element={<PrincipalComplaints />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/report" element={<AttendanceReport />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/study" element={<StudyContentManager />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  </DashboardShell>
);

export default PrincipalDashboard;
