import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatPage from './ChatPage';
import NotesPage from './NotesPage';
import ComplaintsPage from './ComplaintsPage';
import SettingsPage from './SettingsPage';
import AttendancePage from './AttendancePage';
import ResultsPage from './ResultsPage';
import EventsPage from './EventsPage';
import TeacherRatingPage from './TeacherRatingPage';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const StudentHome = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await axios.get(`/api/school/dashboard?role=student&userId=${user.id}&className=${user.class}`);
        setDashboard(res.data);
      } catch (err) {
        // Dashboard silently fails if sheet not ready
      }
    };
    if (user) loadDashboard();
  }, [user?.id, user?.class]);

  const student = dashboard?.student || {};
  const announcements = dashboard?.announcements || [];
  const events = dashboard?.events || [];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-3">
        Welcome back, <span className="text-primary">{user?.name}</span>!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-2 text-gray-400">Attendance</h3>
          <p className="text-4xl font-black text-primary">{student.attendancePercent === null || student.attendancePercent === undefined ? 'No Data' : `${student.attendancePercent}%`}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">From marked attendance</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-2 text-gray-400">Pending Homework</h3>
          <p className="text-4xl font-black text-accent">{student.pendingHomework ?? 0}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">From teacher uploads</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold mb-2 text-gray-400">Class Rank</h3>
          <p className="text-4xl font-black text-purple-400">{student.rank ? `#${student.rank}` : 'No Data'}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Calculated from results</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="text-xl font-bold mb-6">Recent Notices</h2>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500">No announcements yet.</p>
            ) : announcements.map((notice) => (
              <div key={notice.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
                <div>
                  <p className="font-bold text-sm mb-1">{notice.title}</p>
                  <p className="text-xs text-gray-500">{notice.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="text-xl font-bold mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No events posted yet.</p>
            ) : events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-white/5 p-3 rounded-xl min-w-[60px]">
                    <p className="text-xs text-gray-400 uppercase">{event.date ? new Date(event.date).toLocaleString('en-IN', { month: 'short' }) : '--'}</p>
                    <p className="text-lg font-black">{event.date ? new Date(event.date).getDate() : '--'}</p>
                  </div>
                  <div>
                    <p className="font-bold">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.venue} • {event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="student" />
      <main className="flex-1 ml-64 min-h-screen pt-20">
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
      </main>
    </div>
  );
};

export default StudentDashboard;
