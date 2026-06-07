import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Loader2, CalendarDays, Save } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [className, setClassName] = useState(user?.class && user.class !== 'N/A' ? user.class : '10');
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canMark = user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      if (canMark) {
        const [studentRes, attendanceRes] = await Promise.all([
          axios.get(`/api/school/users?role=student&className=${className}`),
          axios.get(`/api/school/attendance?className=${className}`)
        ]);
        setStudents(studentRes.data);
        setAttendance(attendanceRes.data);
        setRecords(studentRes.data.map((student) => ({
          studentId: student.id,
          studentName: student.name,
          status: 'present'
        })));
      } else {
        const res = await axios.get(`/api/school/attendance?studentId=${user.id}`);
        setAttendance(res.data);
      }
    } catch (err) {
      console.error('Attendance load failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user?.id, className]);

  const updateStatus = (studentId, status) => {
    setRecords((prev) => prev.map((record) => (
      record.studentId === studentId ? { ...record, status } : record
    )));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      await axios.post('/api/school/attendance', {
        date,
        className,
        markedBy: user.id,
        records
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Attendance save failed');
    } finally {
      setSaving(false);
    }
  };

  const present = attendance.filter((row) => row.status === 'present').length;
  const percent = attendance.length ? Math.round((present / attendance.length) * 100) : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><Users /></div>
          Attendance
        </h1>
        {canMark && (
          <div className="flex gap-3">
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none">
              {['9', '10', '11', '12'].map((klass) => <option className="bg-background" key={klass} value={klass}>Class {klass}</option>)}
            </select>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-effect p-6 rounded-3xl border border-white/5">
              <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Records</p>
              <p className="text-4xl font-black">{attendance.length}</p>
            </div>
            <div className="glass-effect p-6 rounded-3xl border border-white/5">
              <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Present</p>
              <p className="text-4xl font-black text-emerald-400">{present}</p>
            </div>
            <div className="glass-effect p-6 rounded-3xl border border-white/5">
              <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-2">Attendance</p>
              <p className="text-4xl font-black text-primary">{percent === null ? 'No Data' : `${percent}%`}</p>
            </div>
          </div>

          {canMark && (
            <div className="glass-effect p-8 rounded-[2rem] border border-white/5 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Mark Class {className}</h2>
                <button onClick={saveAttendance} disabled={saving || records.length === 0} className="px-5 py-3 bg-primary rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save
                </button>
              </div>
              {records.length === 0 ? (
                <p className="text-gray-500">No students found in this class.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {records.map((record) => (
                    <div key={record.studentId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                      <div>
                        <p className="font-bold">{record.studentName}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">{record.studentId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(record.studentId, 'present')} className={`p-2 rounded-xl ${record.status === 'present' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}><CheckCircle size={18} /></button>
                        <button onClick={() => updateStatus(record.studentId, 'absent')} className={`p-2 rounded-xl ${record.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400'}`}><XCircle size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {attendance.length === 0 ? (
              <div className="text-center py-16 glass-effect rounded-[2rem] border border-white/5 text-gray-500">No attendance records yet.</div>
            ) : attendance.map((row) => (
              <motion.div key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-effect p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CalendarDays className="text-primary" />
                  <div>
                    <p className="font-bold">{row.studentName || user.name}</p>
                    <p className="text-xs text-gray-500">Class {row.className} - {row.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${row.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{row.status}</span>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
