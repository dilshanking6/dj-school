import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Loader2, Plus, Send, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

const STAFF = ['teacher', 'principal', 'admin'];
const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';
const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';

const EventsPage = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEvent, setShowEvent] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', venue: '', description: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', audience: 'All' });

  const socket = useSocket();
  const canCreate = STAFF.includes(user?.role);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventRes, noticeRes] = await Promise.all([
        axios.get('/api/school/events'),
        axios.get('/api/school/announcements')
      ]);
      setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
      setAnnouncements(Array.isArray(noticeRes.data) ? noticeRes.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Events could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return undefined;

    const onEvent = (event) => {
      setEvents((prev) => [...prev, event].sort((a, b) => String(a.date).localeCompare(String(b.date))));
      toast.success(`New event: ${event.title}`);
    };

    const onNotice = (notice) => {
      if (notice.audience === 'All' || notice.audience === user?.role) {
        setAnnouncements((prev) => [notice, ...prev]);
        toast.success(`New notice: ${notice.title}`);
      }
    };

    socket.on('new_event', onEvent);
    socket.on('new_announcement', onNotice);
    // Server ye dono delete events bhejta tha, par yahan koi listener nahi
    // tha — isliye koi teacher/office event ya notice delete karta to baaki sab
    // ke screens par wo turant gayab nahi hota tha, sirf refresh ke baad.
    // Ab doosre device par bhi delete turant live ho jaata hai.
    socket.on('event_deleted', ({ id }) => {
      setEvents((prev) => prev.filter((item) => item.id !== id));
    });
    socket.on('announcement_deleted', ({ id }) => {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    });

    return () => {
      socket.off('new_event', onEvent);
      socket.off('new_announcement', onNotice);
      socket.off('event_deleted');
      socket.off('announcement_deleted');
    };
  }, [socket, user?.role]);

  const createEvent = async (event) => {
    event.preventDefault();
    const loadingToast = toast.loading('Publishing event');
    try {
      await axios.post('/api/school/events', eventForm);
      setEventForm({ title: '', date: '', time: '', venue: '', description: '' });
      setShowEvent(false);
      toast.success('Event published', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Event could not be published', { id: loadingToast });
    }
  };

  const createNotice = async (event) => {
    event.preventDefault();
    const loadingToast = toast.loading('Publishing notice');
    try {
      await axios.post('/api/school/announcements', noticeForm);
      setNoticeForm({ title: '', message: '', audience: 'All' });
      setShowNotice(false);
      toast.success('Notice published', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Notice could not be published', { id: loadingToast });
    }
  };

  const removeEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`/api/school/events/${id}`);
      setEvents((prev) => prev.filter((item) => item.id !== id));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Event could not be deleted');
    }
  };

  const removeNotice = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await axios.delete(`/api/school/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
      toast.success('Notice deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Notice could not be deleted');
    }
  };

  const canRemove = (item) => user?.role === 'admin' || item.createdBy === user?.id;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-black sm:gap-4 sm:text-3xl">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Calendar size={24} />
          </span>
          Events and notices
        </h1>

        {canCreate && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setShowNotice((prev) => !prev)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-colors ${
                showNotice ? 'bg-primary text-white' : 'glass-effect text-slate-200'
              }`}
            >
              {showNotice ? <X size={18} /> : <Bell size={18} />}
              Notice
            </button>
            <button
              onClick={() => setShowEvent((prev) => !prev)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition-colors ${
                showEvent ? 'bg-primary text-white' : 'bg-primary text-white'
              }`}
            >
              {showEvent ? <X size={18} /> : <Plus size={18} />}
              Event
            </button>
          </div>
        )}
      </div>

      {showEvent && canCreate && (
        <form onSubmit={createEvent} className={`${card} mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2`}>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="event-title">Event title</label>
            <input
              id="event-title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="e.g. Annual Sports Day"
              className={field}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="event-date">Date</label>
            <input
              id="event-date"
              type="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              className={field}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="event-time">Time</label>
            <input
              id="event-time"
              type="time"
              value={eventForm.time}
              onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
              className={field}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="event-venue">Venue</label>
            <input
              id="event-venue"
              value={eventForm.venue}
              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
              placeholder="e.g. School ground"
              className={field}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="What students should know"
              rows={3}
              className={`${field} resize-none`}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white">
              <Send size={17} />
              Publish event
            </button>
          </div>
        </form>
      )}

      {showNotice && canCreate && (
        <form onSubmit={createNotice} className={`${card} mb-6 grid grid-cols-1 gap-4`}>
          <div>
            <label className={label} htmlFor="notice-title">Notice title</label>
            <input
              id="notice-title"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              placeholder="Notice title"
              className={field}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="notice-audience">Audience</label>
            <select
              id="notice-audience"
              value={noticeForm.audience}
              onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
              className={field}
            >
              {['All', 'student', 'teacher', 'principal'].map((item) => (
                <option key={item} value={item}>{item === 'All' ? 'Everyone' : `${item}s`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="notice-message">Message</label>
            <textarea
              id="notice-message"
              value={noticeForm.message}
              onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
              placeholder="Message"
              rows={3}
              className={`${field} resize-none`}
              required
            />
          </div>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white">
            <Send size={17} />
            Publish notice
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={34} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <section>
            <h2 className="mb-4 font-bold">Notices</h2>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className={`${card} text-sm text-slate-500`}>No notices have been posted yet.</div>
              ) : (
                announcements.map((item) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={card}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                        {item.audience === 'All' ? 'Everyone' : `${item.audience}s`}
                      </p>
                      {canRemove(item) && (
                        <button
                          onClick={() => removeNotice(item.id)}
                          className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/10"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.message}</p>
                  </motion.article>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-bold">Events</h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className={`${card} text-sm text-slate-500`}>No events have been scheduled yet.</div>
              ) : (
                events.map((item) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={card}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.description}</p>
                        <p className="mt-2 text-xs text-slate-500">{item.venue}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-primary">{item.date}</p>
                        {item.time && <p className="text-xs text-slate-500">{item.time}</p>}
                        {canRemove(item) && (
                          <button
                            onClick={() => removeEvent(item.id)}
                            className="mt-2 rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/10"
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
