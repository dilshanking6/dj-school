import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, Clock, CheckCircle, XCircle, Loader2, MessageSquareWarning } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
  accepted: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  resolved: 'bg-primary/10 border-primary/20 text-primary',
  rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-500'
};

const STATUS_ICONS = {
  pending: Clock,
  accepted: CheckCircle,
  resolved: CheckCircle,
  rejected: XCircle
};

const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const ComplaintsPage = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ subject: '', description: '' });

  const socket = useSocket();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/complaints/student/${user.id}`);
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Complaints could not be loaded');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (!socket) return undefined;

    const onUpdate = (data) => {
      setComplaints((prev) => prev.map((c) => (c.id === data.id ? { ...c, status: data.status } : c)));
      toast.success(`Complaint marked ${data.status}`);
    };

    socket.on('complaint_status_updated', onUpdate);
    return () => socket.off('complaint_status_updated', onUpdate);
  }, [socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading('Sending to the principal');
    try {
      await axios.post('/api/complaints', { subject: formData.subject, description: formData.description });
      setFormData({ subject: '', description: '' });
      await fetchComplaints();
      toast.success('Complaint sent', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Complaint could not be sent', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-black sm:mb-8 sm:gap-4 sm:text-3xl">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <HelpCircle size={24} />
        </span>
        Help &amp; Complaints
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        <form onSubmit={handleSubmit} className="glass-effect h-fit rounded-3xl border border-white/5 p-5 sm:p-6 lg:col-span-2 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-bold">Send a complaint</h2>

          <div className="space-y-4">
            <div>
              <label className={label} htmlFor="complaint-subject">Subject</label>
              <input
                id="complaint-subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Library book is missing pages"
                className={field}
                maxLength={140}
                required
              />
            </div>

            <div>
              <label className={label} htmlFor="complaint-description">Description</label>
              <textarea
                id="complaint-description"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the issue so it can be resolved quickly"
                className={`${field} resize-none`}
                maxLength={3000}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Send to principal
            </button>

            <p className="text-center text-[11px] leading-relaxed text-slate-500">
              You can track the status of your complaint below.
            </p>
          </div>
        </form>

        <section className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold">Your complaints</h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={34} />
            </div>
          ) : complaints.length === 0 ? (
            <div className="glass-effect rounded-3xl border border-white/5 px-5 py-16 text-center">
              <MessageSquareWarning className="mx-auto mb-4 text-slate-600" size={44} />
              <p className="text-sm text-slate-500">You have not raised any complaint yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => {
                const Icon = STATUS_ICONS[complaint.status] || Clock;
                return (
                  <motion.article
                    key={complaint.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-3xl border border-white/5 p-5"
                  >
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold">{complaint.subject}</h3>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                          {formatDate(complaint.date)}
                        </p>
                      </div>
                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${
                          STATUS_STYLES[complaint.status] || STATUS_STYLES.pending
                        }`}
                      >
                        <Icon size={13} />
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">{complaint.description}</p>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ComplaintsPage;
