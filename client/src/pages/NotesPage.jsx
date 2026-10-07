import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, Plus, FileText, Loader2, Search, Trash2, Paperclip, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

const STAFF = ['teacher', 'principal', 'admin'];
const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';
const card = 'glass-effect rounded-3xl border border-white/5 p-5 sm:p-6';

const emptyForm = (className) => ({
  title: '', subject: '', className, fileUrl: '', type: 'note', description: '', fileName: '', fileData: ''
});

const NotesPage = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm('All'));

  const socket = useSocket();
  const canShare = STAFF.includes(user?.role);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const endpoint = canShare ? '/api/notes/all' : `/api/notes/class/${user?.class || 'All'}`;
      const res = await axios.get(endpoint);
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Material could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!canShare) setFormData((prev) => ({ ...prev, className: user?.class || 'All' }));
  }, [user?.class, canShare]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNote = (note) => {
      const noteClass = String(note.className || '').toLowerCase();
      const userClass = String(user?.class || '').toLowerCase();
      if (canShare || noteClass === 'all' || noteClass === userClass) {
        setNotes((prev) => [note, ...prev]);
        toast.success(`New ${note.type} shared: ${note.title}`);
      }
    };

    socket.on('new_note', onNote);
    // Server `note_deleted` bhejta tha par yahan listener nahi tha — matlab
    // teacher ne material delete kiya to baaki sab ke screen par wo turant
    // hatta nahi tha, sirf page refresh karne par gaya. Ab live hota hai.
    socket.on('note_deleted', ({ id }) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    });
    return () => {
      socket.off('new_note', onNote);
      socket.off('note_deleted');
    };
  }, [socket, user?.class, canShare]);

  const handleAddNote = async (event) => {
    event.preventDefault();
    const loadingToast = toast.loading('Sharing material');
    try {
      await axios.post('/api/notes', formData);
      setShowAdd(false);
      setFormData(emptyForm(canShare ? 'All' : user?.class || 'All'));
      toast.success('Material shared', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Material could not be shared', { id: loadingToast });
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10000) {
      toast.error('Inline uploads are limited to 10 KB. Share a Google Drive link instead.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, fileName: file.name, fileData: reader.result }));
    reader.onerror = () => toast.error('That file could not be read');
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    const loadingToast = toast.loading('Deleting material');
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast.success('Material deleted', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Material could not be deleted', { id: loadingToast });
    }
  };

  const term = search.trim().toLowerCase();
  const filteredNotes = notes.filter(
    (note) =>
      !term ||
      String(note.title || '').toLowerCase().includes(term) ||
      String(note.subject || '').toLowerCase().includes(term)
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-black sm:gap-4 sm:text-3xl">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <BookOpen size={24} />
          </span>
          Study material
        </h1>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              type="search"
              placeholder="Search material"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${field} pl-11`}
            />
          </div>
          {canShare && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white"
            >
              <Plus size={18} />
              Share material
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={34} />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className={`${card} py-16 text-center`}>
          <FileText className="mx-auto mb-4 text-slate-600" size={44} />
          <p className="text-sm text-slate-500">No material has been shared for your class yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <motion.article
              key={note.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect flex flex-col rounded-3xl border border-white/5 p-5 transition-colors hover:border-primary/25"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                <FileText size={22} />
              </div>

              <h3 className="font-bold">{note.title}</h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                {note.subject} · {note.type}
              </p>
              {note.description && (
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{note.description}</p>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                    {(note.teacherName || 'T').charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate text-[10px] font-bold uppercase text-slate-500">
                    {note.teacherName || 'Teacher'}
                  </span>
                </div>

                <div className="flex shrink-0 gap-2">
                  {canShare && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/10"
                      aria-label={`Delete ${note.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  {(note.fileData || note.fileUrl) && (
                    <a
                      href={note.fileData || note.fileUrl}
                      download={note.fileData ? note.fileName : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary hover:text-white"
                      aria-label={`Open ${note.title}`}
                    >
                      <Download size={15} />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && canShare && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onSubmit={handleAddNote}
              className="glass-effect max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black">Share material</h2>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl p-2 transition-colors hover:bg-white/10"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={label} htmlFor="note-title">Title</label>
                  <input
                    id="note-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Chapter 1: Chemical Reactions"
                    className={field}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="note-subject">Subject</label>
                    <input
                      id="note-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Chemistry"
                      className={field}
                      required
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="note-type">Type</label>
                    <select
                      id="note-type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={field}
                    >
                      <option value="note">Note</option>
                      <option value="homework">Homework</option>
                      <option value="assignment">Assignment</option>
                    </select>
                  </div>
                </div>

                {user?.role === 'teacher' && (
                  <div>
                    <label className={label} htmlFor="note-class">Class</label>
                    <select
                      id="note-class"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className={field}
                    >
                      {['All', '9', '10', '11', '12'].map((item) => (
                        <option key={item} value={item}>{item === 'All' ? 'All classes' : `Class ${item}`}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={label} htmlFor="note-description">Description</label>
                  <textarea
                    id="note-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Instructions for students"
                    rows={3}
                    className={`${field} resize-none`}
                  />
                </div>

                <div>
                  <label className={label} htmlFor="note-url">Google Drive link</label>
                  <input
                    id="note-url"
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className={field}
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-primary/40">
                  <Paperclip size={18} className="text-primary" />
                  <span className="truncate text-sm font-bold">{formData.fileName || 'Attach a file (max 10 KB)'}</span>
                  <input type="file" className="hidden" onChange={handleFile} />
                </label>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 rounded-2xl glass-effect py-3.5 text-sm font-bold transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white">
                    Share
                  </button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
