import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Plus, FileText, Loader2, Search, Trash2, Paperclip } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { socket } from '../api/socket';

const NotesPage = () => {
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({ 
    title: '', 
    subject: '', 
    className: user?.role === 'teacher' ? 'All' : (user?.class || 'All'), 
    fileUrl: '', 
    type: 'note', 
    description: '', 
    fileName: '', 
    fileData: '' 
  });

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const fetchNotes = async () => {
    try {
      const isAdminOrTeacher = user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'admin';
      const endpoint = isAdminOrTeacher ? '/api/notes/all' : `/api/notes/class/${user?.class || 'All'}`;
      const res = await axios.get(endpoint);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    socket.on('new_note', (note) => {
      const noteClass = String(note.className || '').toLowerCase();
      const userClass = String(user?.class || '').toLowerCase();
      
      if (noteClass === 'all' || noteClass === userClass) {
        setNotes(prev => [note, ...prev]);
        toast.success(`New ${note.type} shared: ${note.title}`);
      }
    });

    return () => {
      socket.off('new_note');
    };
  }, [user?.class]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sharing material...');
    try {
      await axios.post('/api/notes', {
        teacherId: user.id,
        teacherName: user.name,
        ...formData
      });
      setShowAdd(false);
      setFormData({ 
        title: '', 
        subject: '', 
        className: user?.role === 'teacher' ? 'All' : (user?.class || 'All'), 
        fileUrl: '', 
        type: 'note', 
        description: '', 
        fileName: '', 
        fileData: '' 
      });
      toast.success('Material shared successfully!', { id: loadingToast });
      // fetchNotes(); // Socket handles it
    } catch (err) {
      toast.error('Failed to share material', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10000) {
      toast.error('File too large for Google Sheets! Max 10KB allowed. Please upload to Google Drive and paste the Link instead.');
      e.target.value = '';
      return;
    }
    const fileData = await fileToDataUrl(file);
    setFormData({ ...formData, fileName: file.name, fileData });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    const loadingToast = toast.loading('Deleting note...');
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted successfully', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete note', { id: loadingToast });
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><BookOpen /></div>
          Study Notes & Material
        </h1>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
            />
          </div>
          {user?.role === 'teacher' && (
            <button 
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 bg-primary rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={18} /> Share Note
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 glass-effect rounded-[3rem] border border-white/5">
          <FileText className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-500">No notes found for your class yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect p-6 rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all relative"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-gray-400 group-hover:text-primary transition-colors">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-lg mb-1">{note.title}</h3>
              <p className="text-primary text-xs font-black uppercase tracking-widest mb-4">{note.subject} - {note.type}</p>
              {note.description && <p className="text-sm text-gray-400 mb-4">{note.description}</p>}
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {note.teacherName[0]}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">{note.teacherName}</span>
                </div>
                <div className="flex gap-2">
                  {user?.role === 'teacher' && (
                    <button onClick={() => handleDelete(note.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                  {(note.fileData || note.fileUrl) && <a 
                    href={note.fileData || note.fileUrl} 
                    download={note.fileData ? note.fileName : undefined}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                  >
                    <Download size={16} />
                  </a>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-10 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-lg"
          >
            <h2 className="text-2xl font-black mb-8">Share New Note</h2>
            <form onSubmit={handleAddNote} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Chapter 1: Chemical Reactions"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g. Chemistry"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Class</label>
                  <select 
                    value={formData.className}
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all appearance-none"
                  >
                    <option value="All" className="bg-background">All Classes</option>
                    <option value="9" className="bg-background">Class 9</option>
                    <option value="10" className="bg-background">Class 10</option>
                    <option value="11" className="bg-background">Class 11</option>
                    <option value="12" className="bg-background">Class 12</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Material Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all appearance-none"
                >
                  <option value="note" className="bg-background">Note</option>
                  <option value="homework" className="bg-background">Homework</option>
                  <option value="assignment" className="bg-background">Assignment</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Instructions or note details"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">File URL</label>
                <input 
                  type="url" 
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <label className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/40 transition-all">
                <Paperclip size={18} className="text-primary" />
                <span className="text-sm font-bold">{formData.fileName || 'Upload small file to Google Sheets'}</span>
                <input type="file" className="hidden" onChange={handleFile} />
              </label>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 glass-effect rounded-2xl font-bold hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">Share Now</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
