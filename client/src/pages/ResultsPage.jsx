import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2, Plus, Save } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ResultsPage = () => {
  const { user } = useContext(AuthContext);
  const [className, setClassName] = useState(user?.class && user.class !== 'N/A' ? user.class : '10');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: '', subject: '', marks: '', total: '', exam: '' });
  const canUpload = user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      if (canUpload) {
        const [studentRes, resultRes] = await Promise.all([
          axios.get(`/api/school/users?role=student&className=${className}`),
          axios.get(`/api/school/results?className=${className}`)
        ]);
        setStudents(studentRes.data);
        setResults(resultRes.data);
      } else {
        const res = await axios.get(`/api/school/results?studentId=${user.id}`);
        setResults(res.data);
      }
    } catch (err) {
      console.error('Results load failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user?.id, className]);

  const submitResult = async (e) => {
    e.preventDefault();
    const student = students.find((item) => item.id === form.studentId);
    setSaving(true);
    const loadingToast = toast.loading('Uploading result...');
    try {
      await axios.post('/api/school/results', {
        className,
        studentId: form.studentId,
        studentName: student?.name || '',
        subject: form.subject,
        marks: form.marks,
        total: form.total,
        exam: form.exam,
        uploadedBy: user.id
      });
      toast.success('Result uploaded successfully!', { id: loadingToast });
      setForm({ studentId: '', subject: '', marks: '', total: '', exam: '' });
      setShowForm(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Result upload failed', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary"><Award /></div>
          Results
        </h1>
        {canUpload && (
          <div className="flex gap-3">
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 outline-none">
              {['9', '10', '11', '12'].map((klass) => <option className="bg-background" key={klass} value={klass}>Class {klass}</option>)}
            </select>
            <button onClick={() => setShowForm(true)} className="px-5 py-3 bg-primary rounded-2xl font-bold text-sm flex items-center gap-2"><Plus size={18} /> Upload Result</button>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitResult} className="glass-effect p-6 rounded-[2rem] border border-white/5 mb-8 grid grid-cols-1 md:grid-cols-6 gap-4">
          <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none md:col-span-2" required>
            <option className="bg-background" value="">Select student</option>
            {students.map((student) => <option className="bg-background" key={student.id} value={student.id}>{student.name}</option>)}
          </select>
          <input value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} placeholder="Exam" className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} placeholder="Marks" className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
          <div className="flex gap-2">
            <input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} placeholder="Total" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none" required />
            <button disabled={saving} className="px-4 bg-primary rounded-2xl"><Save size={18} /></button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 glass-effect rounded-[2rem] border border-white/5 text-gray-500">No results uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => {
            const percent = result.total ? Math.round((result.marks / result.total) * 100) : 0;
            return (
              <motion.div key={result.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-effect p-6 rounded-[2rem] border border-white/5">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{result.exam}</p>
                    <h3 className="text-xl font-bold mt-1">{result.subject}</h3>
                    <p className="text-sm text-gray-400 mt-1">{result.studentName} - Class {result.className}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary">{result.marks}/{result.total}</p>
                    <p className="text-xs text-gray-500 font-bold">{percent}%</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
