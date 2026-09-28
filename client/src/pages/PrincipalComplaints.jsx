import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Loader2, User, Inbox } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useSocket from '../hooks/useSocket';

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
  accepted: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  resolved: 'bg-primary/10 border-primary/20 text-primary',
  rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-500'
};

const ACTIONS = {
  pending: [
    { status: 'accepted', label: 'Accept', icon: CheckCircle, tone: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' },
    { status: 'rejected', label: 'Reject', icon: XCircle, tone: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' }
  ],
  accepted: [
    { status: 'resolved', label: 'Mark resolved', icon: CheckCircle, tone: 'bg-primary/10 text-primary hover:bg-primary hover:text-white' }
  ]
};

const PrincipalComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const socket = useSocket();

  const fetchAllComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/complaints/all');
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Complaints could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllComplaints();
  }, [fetchAllComplaints]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNew = (complaint) => {
      setComplaints((prev) => [complaint, ...prev.filter((c) => c.id !== complaint.id)]);
      toast(`New complaint from ${complaint.studentName}`);
    };

    socket.on('new_complaint', onNew);
    return () => socket.off('new_complaint', onNew);
  }, [socket]);

  const handleStatusUpdate = async (id, status) => {
    setBusyId(id);
    const loadingToast = toast.loading(`Marking as ${status}`);
    try {
      await axios.patch(`/api/complaints/${id}/status`, { status });
      setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      toast.success(`Complaint marked ${status}`, { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Status could not be updated', { id: loadingToast });
    } finally {
      setBusyId(null);
    }
  };

  const filtered =
    filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const tabs = ['all', 'pending', 'accepted', 'resolved', 'rejected'];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-black sm:mb-8 sm:gap-4 sm:text-3xl">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <HelpCircle size={24} />
        </span>
        Complaints
      </h1>

      <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => {
          const count = tab === 'all' ? complaints.length : complaints.filter((c) => c.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold capitalize transition-colors ${
                filter === tab
                  ? 'border-primary bg-primary text-white'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {tab} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={34} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-effect rounded-3xl border border-white/5 px-5 py-16 text-center">
          <Inbox className="mx-auto mb-4 text-slate-600" size={44} />
          <p className="text-sm text-slate-500">No complaints to show right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((complaint) => (
            <motion.article
              key={complaint.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-3xl border border-white/5 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-400">
                      <User size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{complaint.studentName}</h3>
                      <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        {complaint.studentId}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-base font-bold">{complaint.subject}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{complaint.description}</p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {new Date(complaint.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="w-full shrink-0 lg:w-52">
                  <span
                    className={`mb-3 block rounded-xl border px-3 py-2 text-center text-[10px] font-bold uppercase ${
                      STATUS_STYLES[complaint.status] || STATUS_STYLES.pending
                    }`}
                  >
                    {complaint.status}
                  </span>

                  <div className="space-y-2">
                    {(ACTIONS[complaint.status] || []).map(({ status, label, icon: Icon, tone }) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(complaint.id, status)}
                        disabled={busyId === complaint.id}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-50 ${tone}`}
                      >
                        {busyId === complaint.id ? <Loader2 className="animate-spin" size={16} /> : <Icon size={16} />}
                        {label}
                      </button>
                    ))}
                    {!ACTIONS[complaint.status] && (
                      <p className="pt-1 text-center text-[11px] text-slate-500">This complaint is closed.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalComplaints;
