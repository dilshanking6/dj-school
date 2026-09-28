import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, Loader2, UsersRound, FileText, Calendar } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import StudyHubCard from '../components/StudyHubCard';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatPage = lazy(() => import('./ChatPage'));
const NotesPage = lazy(() => import('./NotesPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const AttendancePage = lazy(() => import('./AttendancePage'));
const ResultsPage = lazy(() => import('./ResultsPage'));
const EventsPage = lazy(() => import('./EventsPage'));

const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';
const PageLoader = () => (
  <div className="flex min-h-[50dvh] items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={30} />
  </div>
);

const TeacherHome = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const res = await axios.get('/api/school/dashboard');
        if (!cancelled) setDashboard(res.data);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.error || 'Overview could not be loaded');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (user) loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const teacher = dashboard?.teacher || {};
  const assignedClass = user?.class && user.class !== 'N/A' ? `Class ${user.class}` : 'Not assigned to a class yet';

  const stats = [
    { label: 'Class', value: teacher.classes ?? 0, hint: assignedClass, icon: Users, tone: 'text-primary' },
    { label: 'Students', value: teacher.students ?? 0, hint: 'In your class', icon: UsersRound, tone: 'text-accent' },
    { label: 'Material shared', value: teacher.notesShared ?? 0, hint: 'Notes and homework', icon: BookOpen, tone: 'text-violet-400' }
  ];

  const tools = [
    { label: 'Mark attendance', detail: 'Record the daily register', path: '/teacher/attendance', icon: Users, tone: 'text-primary' },
    { label: 'Share material', detail: 'Publish notes or homework', path: '/teacher/homework', icon: FileText, tone: 'text-accent' },
    { label: 'Add results', detail: 'Enter exam marks', path: '/teacher/results', icon: Award, tone: 'text-violet-400' },
    { label: 'Events', detail: 'School calendar', path: '/teacher/events', icon: Calendar, tone: 'text-emerald-400' }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-black sm:mb-8 sm:text-3xl">
        Welcome, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
      </h1>

      <StudyHubCard className="mb-6 sm:mb-8" />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={30} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      )}

      <section className={`${card} mt-5 lg:mt-6`}>
        <h2 className="mb-5 font-bold">Quick tools</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tools.map(({ label, detail, path, icon: Icon, tone }) => (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-start gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-primary/30 hover:bg-white/10"
            >
              <Icon size={20} className={tone} />
              <span className="text-sm font-bold">{label}</span>
              <span className="text-[11px] leading-relaxed text-slate-500">{detail}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const TeacherDashboard = () => (
  <DashboardShell role="teacher">
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/homework" element={<NotesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  </DashboardShell>
);

export default TeacherDashboard;
