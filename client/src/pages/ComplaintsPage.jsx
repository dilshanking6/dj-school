import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Send, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ComplaintsPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [message, setMessage] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`/api/complaints/student/${user.id}`);
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/complaints', {
        studentId: user.id,
        studentName: user.name,
        ...formData
      });
      setMessage('Complaint submitted successfully!');
      setFormData({ subject: '', description: '' });
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="text-emerald-400" size={16} />;
      case 'rejected': return <XCircle className="text-rose-400" size={16} />;
      case 'resolved': return <CheckCircle className="text-primary" size={16} />;
      default: return <Clock className="text-amber-400" size={16} />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><HelpCircle /></div>
        Help & Complaints
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="glass-effect p-8 rounded-[2.5rem] border border-white/5 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Submit New Complaint</h2>
            {message && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g. Issue with library book"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows="5"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all resize-none"
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-primary rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all glow-shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <>Submit to Principal <Send size={18} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6">Your Previous Complaints</h2>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20 glass-effect rounded-[2.5rem] border border-white/5">
              <p className="text-gray-500">No complaints found. All good!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => (
                <motion.div 
                  key={comp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{comp.subject}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
                        {new Date(comp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border ${
                      comp.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                      comp.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      comp.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                      'bg-primary/10 border-primary/20 text-primary'
                    }`}>
                      {getStatusIcon(comp.status)}
                      {comp.status}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{comp.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
