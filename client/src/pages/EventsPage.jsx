import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Loader2, Plus, Send } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EventsPage = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEvent, setShowEvent] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', venue: '', description: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', audience: 'All' });
  const canCreate = user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventRes, announcementRes] = await Promise.all([
        axios.get('/api/school/events'),
        axios.get(`/api/school/announcements?audience=${user?.role || 'All'}`)
      ]);
      setEvents(eventRes.data);
      setAnnouncements(announcementRes.data);
    } catch (err) {
      console.error('Events load failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user?.role]);

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/school/events', { ...eventForm, createdBy: user.id });
      setEventForm({ title: '', date: '', time: '', venue: '', description: '' });
      setShowEvent(false);
      await loadData();
    } catch (err) {
      alert('Event create failed');
    }
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/school/announcements', { ...announcementForm, createdBy: user.id });
      setAnnouncementForm({ title: '', message: '', audience: 'All' });
      setShowAnnouncement(false);
      await loadData();
    } catch (err) {
      alert('Announcement create failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><Calendar /></div>
          Events & Announcements
        </h1>
        {canCreate && (
          <div className="flex gap-3">
            <button onClick={() => setShowAnnouncement(true)} className="px-5 py-3 glass-effect rounded-2xl font-bold text-sm flex items-center gap-2"><Bell size={18} /> Notice</button>
            <button onClick={() => setShowEvent(true)} className="px-5 py-3 bg-primary rounded-2xl font-bold text-sm flex items-center gap-2"><Plus size={18} /> Event</button>
          </div>
        )}
      </div>

      {showEvent && (
        <form onSubmit={createEvent} className="glass-effect p-6 rounded-[2rem] border border-white/5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Event title" className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <input value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} placeholder="Venue" className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" />
          <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Description" className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none resize-none" required />
          <button className="md:col-span-2 py-3 bg-primary rounded-2xl font-bold">Publish Event</button>
        </form>
      )}

      {showAnnouncement && (
        <form onSubmit={createAnnouncement} className="glass-effect p-6 rounded-[2rem] border border-white/5 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Notice title" className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <select value={announcementForm.audience} onChange={(e) => setAnnouncementForm({ ...announcementForm, audience: e.target.value })} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none">
            {['All', 'student', 'teacher', 'principal'].map((item) => <option className="bg-background" key={item} value={item}>{item}</option>)}
          </select>
          <input value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} placeholder="Message" className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <button className="md:col-span-4 py-3 bg-primary rounded-2xl font-bold flex justify-center gap-2"><Send size={18} /> Publish Notice</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Announcements</h2>
            <div className="space-y-4">
              {announcements.length === 0 ? <div className="glass-effect p-8 rounded-2xl text-gray-500">No announcements yet.</div> : announcements.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-effect p-6 rounded-[2rem] border border-white/5">
                  <p className="text-xs text-primary font-black uppercase tracking-widest">{item.audience}</p>
                  <h3 className="text-xl font-bold mt-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 mt-3">{item.message}</p>
                </motion.div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-4">Events</h2>
            <div className="space-y-4">
              {events.length === 0 ? <div className="glass-effect p-8 rounded-2xl text-gray-500">No events yet.</div> : events.map((event) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-effect p-6 rounded-[2rem] border border-white/5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <p className="text-sm text-gray-400 mt-2">{event.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold text-primary">{event.date}</p>
                      <p className="text-gray-500">{event.time}</p>
                      <p className="text-gray-500">{event.venue}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
