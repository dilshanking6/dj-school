import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatPage from './ChatPage';
import PrincipalComplaints from './PrincipalComplaints';
import SettingsPage from './SettingsPage';
import AttendancePage from './AttendancePage';
import ResultsPage from './ResultsPage';
import EventsPage from './EventsPage';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const PrincipalHome = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await axios.get(`/api/school/dashboard?role=principal&userId=${user.id}`);
        setDashboard(res.data);
      } catch (err) {
        console.error('Principal dashboard load failed', err);
      }
    };
    if (user) loadDashboard();
  }, [user?.id]);

  const principal = dashboard?.principal || {};

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-6">Principal Office: <span className="text-primary">{user?.name}</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Students</h3>
          <p className="text-4xl font-black text-primary">{principal.students ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Faculty</h3>
          <p className="text-4xl font-black text-accent">{principal.teachers ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pending Complaints</h3>
          <p className="text-4xl font-black text-rose-500">{principal.pendingComplaints ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Attendance Today</h3>
          <p className="text-4xl font-black text-emerald-400">{principal.attendanceMarkedToday ?? 0}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="text-xl font-bold mb-6">School Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="font-bold mb-4">School Success Rate</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-primary">{dashboard?.stats?.successRate == null ? 'No Data' : `${dashboard.stats.successRate}%`}</span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold">RESULTS</span>
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="font-bold mb-4">Teacher Attendance</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-accent">{principal.attendanceMarkedToday ?? 0}</span>
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold">MARKED TODAY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrincipalDashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="principal" />
      <main className="flex-1 ml-64 min-h-screen pt-20">
        <Routes>
          <Route path="/" element={<PrincipalHome />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/complaints" element={<PrincipalComplaints />} />
          <Route path="/analytics" element={<AttendancePage />} />
          <Route path="/reports" element={<ResultsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default PrincipalDashboard;
