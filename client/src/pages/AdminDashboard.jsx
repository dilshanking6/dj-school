import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatPage from './ChatPage';
import EventsPage from './EventsPage';
import SettingsPage from './SettingsPage';
import { Users, Shield, Database, Activity, Search, CheckCircle, Ban, RotateCcw } from 'lucide-react';
import axios from 'axios';

const AdminHome = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('student');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([
        axios.get('/api/school/dashboard?role=admin'),
        axios.get(`/api/school/users?role=${role}`)
      ]);
      setDashboard(dashRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Admin data load failed', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const setStatus = async (id, status) => {
    try {
      await axios.patch(`/api/school/users/${id}/status`, { status });
      await loadData();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const stats = dashboard?.stats || {};
  const filteredUsers = users.filter((user) => (
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  ));
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><Shield /></div>
        System Administration
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-4 text-gray-500 font-bold text-xs uppercase tracking-widest">
            <Users size={16} /> Total Users
          </div>
          <p className="text-4xl font-black">{stats.totalUsers ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-4 text-emerald-500 font-bold text-xs uppercase tracking-widest">
            <Activity size={16} /> Server Status
          </div>
          <p className="text-4xl font-black text-emerald-500">Live</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-4 text-amber-500 font-bold text-xs uppercase tracking-widest">
            <Database size={16} /> DB Usage
          </div>
          <p className="text-4xl font-black text-amber-500">{stats.ratings ?? 0}</p>
        </div>
        <div className="glass-effect p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-4 text-primary font-bold text-xs uppercase tracking-widest">
            <Activity size={16} /> Uptime
          </div>
          <p className="text-4xl font-black text-primary">{stats.serverUptimeSeconds ?? 0}s</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">User Management</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search system users..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            {['student', 'teacher', 'principal', 'admin'].map((item) => (
              <button key={item} onClick={() => setRole(item)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${role === item ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>{item}</button>
            ))}
          </div>
          
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : filteredUsers.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><Users size={20} /></div>
                  <div>
                    <span className="font-bold">{item.name}</span>
                    <p className="text-xs text-gray-500">{item.email} - {item.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.status === 'banned' ? (
                    <button onClick={() => setStatus(item.id, 'active')} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2"><RotateCcw size={14} /> Unban</button>
                  ) : (
                    <button onClick={() => setStatus(item.id, 'banned')} className="px-4 py-2 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-lg flex items-center gap-2"><Ban size={14} /> Ban</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <h2 className="text-xl font-bold mb-6">System Health</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-500">Students</span>
                <span>{stats.students ?? 0}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-500">Teachers</span>
                <span>{stats.teachers ?? 0}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-full rounded-full"></div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Live Logs</p>
              <div className="space-y-2 font-mono text-[10px] text-gray-500">
                <p className="flex items-center gap-2"><CheckCircle size={10} className="text-emerald-500" /> API connected</p>
                <p className="flex items-center gap-2"><CheckCircle size={10} className="text-emerald-500" /> Google Sheets bridge active</p>
                <p className="flex items-center gap-2"><CheckCircle size={10} className="text-primary" /> Uptime {stats.serverUptimeSeconds ?? 0}s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="flex">
      <Sidebar role="admin" />
      <main className="flex-1 ml-64 min-h-screen pt-20">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
