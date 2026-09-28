import React, { Suspense, lazy, useContext, useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, Users, Bell, Calendar, Loader2, Megaphone, HelpCircle, Star, ClipboardList } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import StudyHubCard from '../components/StudyHubCard';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatPage = lazy(() => import('./ChatPage'));
const NotesPage = lazy(() => import('./NotesPage'));
const ComplaintsPage = lazy(() => import('./ComplaintsPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const AttendancePage = lazy(() => import('./AttendancePage'));
const ResultsPage = lazy(() => import('./ResultsPage'));
const EventsPage = lazy(() => import('./EventsPage'));
const TeacherRatingPage = lazy(() => import('./TeacherRatingPage'));

const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';
const PageLoader = () => (
  <div className="flex min-h-[50dvh] items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={30} />
  </div>
);

const StudentHome = () => {
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

  const student = dashboard?.student || {};
  const announcements = dashboard?.announcements || [];
  const events = dashboard?.events || [];

  const stats = [
    {
      label: 'Attendance',
      value: student.attendancePercent === null || student.attendancePercent === undefined ? '—' : `${student.attendancePercent}%`,
      hint: 'From your marked register',
      icon: Users,
      tone: 'text-primary'
    },
    {
      label: 'Homework shared',
      value: student.pendingHomework ?? 0,
      hint: 'Items posted for your class',
      icon: BookOpen,
      tone: 'text-accent'
    },
    {
      label: 'Average score',
      value: student.averageResult === null || student.averageResult === undefined ? '—' : `${student.averageResult}%`,
      hint: 'From published results',
      icon: Award,
      tone: 'text-violet-400'
    },
    {
      label: 'Class rank',
      value: student.rank ? `#${student.rank}` : '—',
      hint: 'Based on class results',
      icon: Megaphone,
      tone: 'text-emerald-400'
    }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-black sm:mb-8 sm:text-3xl">
        Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
      </h1>

      <StudyHubCard className="mb-6 sm:mb-8" />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={30} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, hint, icon: Icon, tone }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={card}
            >
              <div className={`mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500`}>
                <Icon size={14} className={tone} />
                {label}
              </div>
              <p className={`text-3xl font-black sm:text-4xl ${tone}`}>{value}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{hint}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { name: 'Help & Complaints', path: '/student/complaints', icon: HelpCircle, tone: 'text-rose-400' },
          { name: 'Rate Teachers', path: '/student/rating', icon: Star, tone: 'text-amber-400' },
          { name: 'Results', path: '/student/results', icon: ClipboardList, tone: 'text-emerald-400' },
          { name: 'Events', path: '/student/events', icon: Calendar, tone: 'text-accent' }
        ].map(({ name, path, icon: Icon, tone }) => (
          <Link
            key={path}
            to={path}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:border-primary/30 hover:bg-white/5"
          >
            <Icon size={18} className={`shrink-0 ${tone}`} />
            <span className="text-sm font-bold">{name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:mt-8 lg:grid-cols-2 lg:gap-6">
        <section className={card}>
          <h2 className="mb-5 flex items-center gap-2 font-bold">
            <Bell size={18} className="text-primary" />
            Recent notices
          </h2>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500">No notices have been posted yet.</p>
            ) : (
              announcements.map((notice) => (
                <article key={notice.id} className="rounded-2xl bg-white/5 p-4">
                  <p className="mb-1 font-bold">{notice.title}</p>
                  <p className="text-sm leading-relaxed text-slate-400">{notice.message}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-5 flex items-center gap-2 font-bold">
            <Calendar size={18} className="text-accent" />
            Upcoming events
          </h2>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No events have been scheduled yet.</p>
            ) : (
              events.map((event) => (
                <article key={event.id} className="flex items-center gap-4 rounded-2xl border border-white/5 p-4">
                  <div className="min-w-[3.5rem] rounded-xl bg-white/5 px-2 py-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {event.date ? new Date(event.date).toLocaleString('en-IN', { month: 'short' }) : '--'}
                    </p>
                    <p className="text-lg font-black">
                      {event.date ? new Date(event.date).getDate() : '--'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{event.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[event.venue, event.time].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const StudentDashboard = () => (
  <DashboardShell role="student">
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/homework" element={<NotesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/rating" element={<TeacherRatingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
      </Routes>
    </Suspense>
  </DashboardShell>
);

export default StudentDashboard;
