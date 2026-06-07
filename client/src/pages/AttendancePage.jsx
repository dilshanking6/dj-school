import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Loader2, CalendarDays, Save, Search, UserCheck, LayoutGrid, Check, Plus, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [className, setClassName] = useState(user?.class && user.class !== 'N/A' ? user.class : '10');
  const [searchTerm, setSearchTerm] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [markingList, setMarkingList] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canMark = user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'admin';

  const fetchRegisteredStudents = async () => {
    setLoading(true);
    try {
      if (canMark) {
        // 1. Fetch registered students for THIS class
        const studentRes = await axios.get(`/api/school/users?role=student&className=${className}`);
        const students = studentRes.data;
        setRegisteredStudents(students);

        // 2. Fetch existing attendance for this class
        const historyRes = await axios.get(`/api/school/attendance?className=${className}`);
        const history = historyRes.data;
        setAttendanceHistory(history);

        // 3. Find if attendance is already marked for today
        const todayRecords = history.filter(h => h.date === date);

        if (todayRecords.length > 0) {
          // If already marked, show existing status
          setMarkingList(todayRecords.map(r => ({
            studentId: r.studentId,
            studentName: r.studentName,
            status: r.status
          })));
        } else {
          // Otherwise, show ALL registered students as 'present' by default
          setMarkingList(students.map(s => ({
            studentId: s.id,
            studentName: s.name,
            status: 'present'
          })));
        }
      } else {
        // For students, just show their own history
        const res = await axios.get(`/api/school/attendance?studentId=${user.id}`);
        setAttendanceHistory(res.data);
      }
    } catch (err) {
      console.error('Attendance fetch failed', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRegisteredStudents();
  }, [user?.id, className, date]);

  const updateStatus = (studentId, status) => {
    setMarkingList((prev) => prev.map((record) => (
      record.studentId === studentId ? { ...record, status } : record
    )));
  };

  const saveAttendance = async () => {
    if (markingList.length === 0) return;
    setSaving(true);
    const loadingToast = toast.loading('Recording attendance...');
    try {
      await axios.post('/api/school/attendance', {
        date,
        className,
        markedBy: user.id,
        records: markingList
      });
      toast.success('Attendance saved for today!', { id: loadingToast });
      fetchRegisteredStudents();
    } catch (err) {
      toast.error('Save failed', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = markingList.filter(s => 
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.studentId).includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-lg"><Users size={32} /></div>
          Smart Attendance
        </h1>
        {canMark && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <span className="text-[10px] font-black text-gray-500 uppercase">Class</span>
              <select 
                value={className} 
                onChange={(e) => setClassName(e.target.value)} 
                className="bg-transparent outline-none font-bold text-sm"
              >
                {['9', '10', '11', '12'].map((klass) => <option className="bg-background" key={klass} value={klass}>{klass}</option>)}
              </select>
            </div>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 outline-none focus:border-primary/50 font-bold text-sm" 
            />
            <button 
              onClick={fetchRegisteredStudents}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400"
              title="Sync Registered Students"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" size={48} /></div>
      ) : (
        <>
          {canMark && (
            <div className="glass-effect p-8 md:p-12 rounded-[3rem] border border-white/5 mb-12 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-2xl font-black">Attendance List: Class {className}</h2>
                  <p className="text-gray-500 text-sm mt-1 font-bold">
                    Showing {markingList.length} registered students for {new Date(date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Quick find student..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-primary/50 w-full md:w-64 transition-all text-sm font-bold"
                    />
                  </div>
                  <button 
                    onClick={saveAttendance} 
                    disabled={saving || markingList.length === 0}
                    className="px-8 py-3 bg-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={20} />} Submit All
                  </button>
                </div>
              </div>

              {markingList.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <UserCheck className="mx-auto text-gray-700 mb-4" size={48} />
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No students registered in Class {className}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {filteredStudents.map((record) => (
                      <motion.div 
                        key={record.studentId}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-6 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                            record.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            <UserCheck size={24} />
                          </div>
                          <div>
                            <p className="font-black text-lg">{record.studentName}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">ID: {String(record.studentId).slice(-6)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateStatus(record.studentId, 'present')} 
                            className={`p-4 rounded-2xl transition-all ${
                              record.status === 'present' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            <CheckCircle size={24} />
                          </button>
                          <button 
                            onClick={() => updateStatus(record.studentId, 'absent')} 
                            className={`p-4 rounded-2xl transition-all ${
                              record.status === 'absent' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                            }`}
                          >
                            <XCircle size={24} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-black mb-6 px-2 flex items-center gap-3">
              <CalendarDays className="text-gray-500" size={20} />
              Recent History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendanceHistory.slice(0, 20).map((row, idx) => (
                <div key={idx} className="glass-effect p-6 rounded-[1.5rem] border border-white/5 flex items-center justify-between hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary"><Users size={20} /></div>
                    <div>
                      <p className="font-bold text-sm">{row.studentName}</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(row.date).toDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                    row.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {row.status}
                  </span>
                </div>
              ))}
              {attendanceHistory.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-600 font-bold uppercase text-[10px] tracking-widest">No activity found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
