import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatPage from './ChatPage';
import NotesPage from './NotesPage';
import SettingsPage from './SettingsPage';
import AttendancePage from './AttendancePage';
import ResultsPage from './ResultsPage';
import EventsPage from './EventsPage';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TeacherHome = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await axios.get(`/api/school/dashboard?role=teacher&userId=${user.id}&className=${user.class}`);
        setDashboard(res.data);
      } catch (err) {
        console.error('Teacher dashboard load failed', err);
      }
    };
    if (user) loadDashboard();
  }, [user?.id, user?.class]);

  const teacher = dashboard?.teacher || {};

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-3">
        Teacher Portal: <span className="text-primary">{user?.name}</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-2 text-gray-400">Classes</h3>
          <p className="text-4xl font-black text-primary">{teacher.classes ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-2 text-gray-400">Total Students</h3>
          <p className="text-4xl font-black text-accent">{teacher.students ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-2 text-gray-400">Notes Shared</h3>
          <p className="text-4xl font-black text-purple-400">{teacher.notesShared ?? 0}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="text-xl font-bold mb-6">Quick Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/teacher/attendance" className="p-6 bg-white/5 rounded-2xl hover:bg-primary/20 hover:text-primary transition-all border border-white/5 flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase">Mark Attendance</span>
            </a>
            <a href="/teacher/homework" className="p-6 bg-white/5 rounded-2xl hover:bg-accent/20 hover:text-accent transition-all border border-white/5 flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase">Upload Notes</span>
            </a>
            <a href="/teacher/events" className="p-6 bg-white/5 rounded-2xl hover:bg-purple-500/20 hover:text-purple-400 transition-all border border-white/5 flex flex-col items-center gap-3">
              <span className="text-xs font-bold uppercase">New Notice</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-64 min-h-screen pt-20">
        <Routes>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/homework" element={<NotesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;
