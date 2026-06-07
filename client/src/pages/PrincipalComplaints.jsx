import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import axios from 'axios';

const PrincipalComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllComplaints = async () => {
    try {
      const res = await axios.get('/api/complaints/all');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`/api/complaints/${id}/status`, { status });
      fetchAllComplaints();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><HelpCircle /></div>
        Student Complaints Management
      </h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 glass-effect rounded-[3rem] border border-white/5">
          <p className="text-gray-500">No complaints filed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((comp) => (
            <motion.div 
              key={comp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-effect p-8 rounded-[2.5rem] border border-white/5"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-500"><User size={20} /></div>
                    <div>
                      <h4 className="font-bold">{comp.studentName}</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Student ID: {comp.studentId}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{comp.subject}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{comp.description}</p>
                  <p className="text-[10px] text-gray-500 font-bold italic">{new Date(comp.date).toLocaleString()}</p>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div className={`text-center py-2 rounded-xl text-[10px] font-black uppercase border mb-2 ${
                    comp.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    comp.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    comp.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                    'bg-primary/10 border-primary/20 text-primary'
                  }`}>
                    Current Status: {comp.status}
                  </div>

                  {comp.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(comp.id, 'accepted')}
                        className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Accept Complaint
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(comp.id, 'rejected')}
                        className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Reject Complaint
                      </button>
                    </>
                  )}
                  
                  {comp.status === 'accepted' && (
                    <button 
                      onClick={() => handleStatusUpdate(comp.id, 'resolved')}
                      className="w-full py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalComplaints;
