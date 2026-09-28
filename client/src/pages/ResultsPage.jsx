import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2, Plus, Save, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const STAFF = ['teacher', 'principal', 'admin'];
const field = 'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base outline-none focus:border-primary/50 transition-colors placeholder:text-slate-500';
const label = 'block mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

const ResultsPage = () => {
  const { user } = useContext(AuthContext);
  const [className, setClassName] = useState(user?.class && user.class !== 'N/A' ? user.class : '10');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [average, setAverage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: '', exam: '', subject: '', marks: '', total: '' });

  const canUpload = STAFF.includes(user?.role);

  const loadData = async () => {
    setLoading(true);
    try {
      if (canUpload) {
        const [studentRes, resultRes] = await Promise.all([
          axios.get(`/api/school/users?role=student&className=${className}`),
          axios.get(`/api/school/results?className=${className}`)
        ]);
        setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
        setResults(Array.isArray(resultRes.data?.results) ? resultRes.data.results : []);
        setAverage(resultRes.data?.average ?? null);
      } else {
        const res = await axios.get('/api/school/results');
        setResults(Array.isArray(res.data?.results) ? res.data.results : []);
        setAverage(res.data?.average ?? null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Results could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user?.id, className]);

  const submitResult = async (event) => {
    event.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading('Saving result');
    try {
      await axios.post('/api/school/results', { className, ...form });
      toast.success('Result saved', { id: loadingToast });
      setForm({ studentId: '', exam: '', subject: '', marks: '', total: '' });
      setShowForm(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Result could not be saved', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-black sm:gap-4 sm:text-3xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Award size={24} />
          </span>
          Results
        </h1>

        {canUpload && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className={`${field} sm:w-auto`}
            >
              {['9', '10', '11', '12'].map((klass) => (
                <option key={klass} value={klass}>Class {klass}</option>
              ))}
            </select>
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.99]"
            >
              <Plus size={18} />
              {showForm ? 'Close' : 'Add result'}
            </button>
          </div>
        )}
      </div>

      {!canUpload && average !== null && (
        <div className="glass-effect mb-6 flex items-center gap-4 rounded-2xl border border-white/10 p-5">
          <TrendingUp className="shrink-0 text-primary" size={22} />
          <div>
            <p className="text-2xl font-black">{average}%</p>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Average across {results.length} published {results.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
      )}

      {showForm && canUpload && (
        <form onSubmit={submitResult} className="glass-effect mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-white/10 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className={label} htmlFor="result-student">Student</label>
            <select
              id="result-student"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className={field}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="result-exam">Exam</label>
            <input
              id="result-exam"
              value={form.exam}
              onChange={(e) => setForm({ ...form, exam: e.target.value })}
              placeholder="e.g. Half yearly"
              className={field}
              required
            />
          </div>

          <div>
            <label className={label} htmlFor="result-subject">Subject</label>
            <input
              id="result-subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Subject"
              className={field}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            <div>
              <label className={label} htmlFor="result-marks">Marks</label>
              <input
                id="result-marks"
                type="number"
                min={0}
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                placeholder="0"
                className={field}
                required
              />
            </div>
            <div>
              <label className={label} htmlFor="result-total">Total</label>
              <input
                id="result-total"
                type="number"
                min={1}
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                placeholder="100"
                className={field}
                required
              />
            </div>
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-6 lg:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-60 lg:w-auto"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save result
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : results.length === 0 ? (
        <div className="glass-effect rounded-3xl border border-white/5 py-20 text-center text-sm text-slate-500">
          No results have been published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((result) => {
            const percent = result.total ? Math.round((result.marks / result.total) * 100) : 0;
            return (
              <motion.article
                key={result.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-3xl border border-white/5 p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{result.exam}</p>
                    <h3 className="mt-1 font-bold">{result.subject}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {result.studentName}
                      {result.className && result.className !== 'N/A' ? ` · Class ${result.className}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-primary sm:text-3xl">
                      {result.marks}/{result.total}
                    </p>
                    <p className="text-xs font-bold text-slate-500">{percent}%</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
