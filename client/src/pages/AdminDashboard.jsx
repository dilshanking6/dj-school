import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ShieldCheck, Database, Search, Ban, RotateCcw,
  Trash2, MessageSquare, Loader2, UserCheck, UserPlus, GraduationCap
} from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import StudyHubCard from '../components/StudyHubCard';
import AttendanceToday from '../components/AttendanceToday';
import SessionPanel from '../components/SessionPanel';
import OfficeCreateUser from '../components/OfficeCreateUser';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatPage = lazy(() => import('./ChatPage'));
const EventsPage = lazy(() => import('./EventsPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const StudyContentManager = lazy(() => import('./StudyContentManager'));
const AttendanceReport = lazy(() => import('./AttendanceReport'));

const ROLES = ['student', 'teacher', 'principal', 'admin'];
const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';
const PageLoader = () => (
  <div className="flex min-h-[50dvh] items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={30} />
  </div>
);

const AdminHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('student');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes] = await Promise.all([
        axios.get('/api/school/dashboard'),
        axios.get(`/api/school/users?role=${role}`)
      ]);
      setDashboard(dashRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Data could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const setStatus = async (id, status) => {
    try {
      await axios.patch(`/api/school/users/${id}`, { status });
      toast.success(`Account marked as ${status}`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Status could not be updated');
    }
  };

  const setClass = async (item, className) => {
    try {
      await axios.patch(`/api/school/users/${item.id}`, { className });
      toast.success(`${item.name} moved to class ${className}`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Class could not be updated');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    const loadingToast = toast.loading('Deleting account');
    try {
      await axios.delete(`/api/auth/delete/${id}`);
      toast.success('Account deleted', { id: loadingToast });
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Account could not be deleted', { id: loadingToast });
    }
  };

  const stats = dashboard?.stats || {};

  const cards = [
    { label: 'Students', value: stats.students ?? 0, icon: Users, tone: 'text-primary' },
    { label: 'Teachers', value: stats.teachers ?? 0, icon: Users, tone: 'text-amber-400' },
    { label: 'Administrators', value: stats.admins ?? 0, icon: Database, tone: 'text-emerald-400' },
    { label: 'Passed out', value: stats.passedOut ?? 0, icon: GraduationCap, tone: 'text-slate-300' }
  ];

  const term = search.trim().toLowerCase();
  const filteredUsers = users.filter(
    (item) =>
      !term ||
      (item.name || '').toLowerCase().includes(term) ||
      (item.email || '').toLowerCase().includes(term)
  );

  const breakdown = stats.classBreakdown
    || Object.fromEntries(
      Object.entries(stats.classWiseStudents || {}).map(([k, v]) => [k, { total: v, boys: 0, girls: 0 }])
    );
  const classEntries = Object.entries(breakdown).sort(([a], [b]) => a.localeCompare(b));
  const totalStudents = stats.students || 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-black sm:mb-8 sm:text-3xl">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <ShieldCheck size={24} />
        </span>
        Administration
      </h1>

      <StudyHubCard className="mb-6 sm:mb-8" compact />

      <section className={`${card} mb-5 lg:mb-6`}>
        <h2 className="mb-5 flex items-center gap-2 font-bold text-primary">
          <UserPlus size={18} />
          Create account
        </h2>
        <OfficeCreateUser role="admin" onCreated={loadData} />
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
            <div className={`mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500`}>
              <Icon size={14} className={tone} />
              {label}
            </div>
            <p className={`text-3xl font-black sm:text-4xl ${tone}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 lg:mt-6">
        <SessionPanel onChanged={loadData} />
      </div>

      <section className={`${card} mt-5 lg:mt-6`}>
        <AttendanceToday />
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-3 lg:gap-6">
        <section className={`${card} lg:col-span-2`}>
          <h2 className="mb-5 font-bold">User management</h2>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search by name or email"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50"
            />
          </div>

          <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
            {ROLES.map((item) => (
              <button
                key={item}
                onClick={() => setRole(item)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  role === item ? 'bg-primary text-white' : 'bg-white/5 text-slate-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={26} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No accounts match this filter.</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((item) => {
                const statusTone =
                  item.status === 'banned'
                    ? 'bg-rose-500/15 text-rose-400'
                    : item.status === 'pending'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-400';

                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Users size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{item.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {item.email}
                          {item.class && item.class !== 'N/A' ? ` · Class ${item.class}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${statusTone}`}>
                        {item.status}
                      </span>

                      {(item.role === 'student' || item.role === 'teacher') && (
                        <select
                          value={['9', '10', '11', '12'].includes(item.class) ? item.class : '9'}
                          onChange={(e) => setClass(item, e.target.value)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs font-bold text-slate-300 outline-none focus:border-primary/50 [color-scheme:dark]"
                          aria-label={`Class for ${item.name}`}
                        >
                          {['9', '10', '11', '12'].map((c) => <option key={c} value={c}>Cls {c}</option>)}
                        </select>
                      )}

                      <Link
                        to={`/admin/chat`}
                        className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white"
                        aria-label={`Message ${item.name}`}
                      >
                        <MessageSquare size={15} />
                      </Link>

                      {item.status === 'pending' && (
                        <button
                          onClick={() => setStatus(item.id, 'active')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white"
                        >
                          <UserCheck size={15} />
                          Approve
                        </button>
                      )}

                      {item.status === 'banned' ? (
                        <button
                          onClick={() => setStatus(item.id, 'active')}
                          className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-white"
                          aria-label={`Restore ${item.name}`}
                        >
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatus(item.id, 'banned')}
                          className="rounded-lg bg-rose-500/10 p-2.5 text-rose-400 transition-colors hover:bg-rose-500 hover:text-white"
                          aria-label={`Suspend ${item.name}`}
                        >
                          <Ban size={15} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(item.id, item.name)}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-400 transition-colors hover:bg-rose-500 hover:text-white"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-5 font-bold text-primary">Students by class</h2>

          {classEntries.length === 0 ? (
            <p className="text-sm text-slate-500">No class data available yet.</p>
          ) : (
            <div className="space-y-5">
              {classEntries.map(([cls, info]) => (
                <div key={cls}>
                  <div className="mb-2 flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Class {cls}</span>
                    <span className="text-primary">{info.total}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${totalStudents ? (info.total / totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex gap-3 text-[10px] font-bold text-slate-500">
                    <span>👦 {info.boys} boys</span>
                    <span>👧 {info.girls} girls</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-white/5 pt-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Portal overview</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs text-slate-500">Events</p>
                <p className="text-xl font-black">{stats.activeEvents ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs text-slate-500">Complaints</p>
                <p className="text-xl font-black">{stats.totalComplaints ?? 0}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const AdminDashboard = () => (
  <DashboardShell role="admin">
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/attendance" element={<AttendanceReport />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/study" element={<StudyContentManager />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  </DashboardShell>
);

export default AdminDashboard;
