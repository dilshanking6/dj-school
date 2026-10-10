import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2, Users, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

const AddStudentModal = ({ className, open, onClose, onCreated }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    gender: '',
    rollNumber: '',
    phone: '',
    email: '',
    password: ''
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.fatherName.trim() && !form.motherName.trim()) {
      toast.error('At least one parent name is required');
      return;
    }
    setSaving(true);
    const loadingToast = toast.loading('Adding student');
    try {
      const res = await axios.post('/api/school/users', {
        role: 'student',
        className,
        ...form
      });
      const created = res.data?.user;
      toast.success(
        created?.email
          ? `Student added — login: ${created.email} / ${created.password || form.password || 'set a password'}`
          : 'Student added',
        { id: loadingToast, duration: 6000 }
      );
      setForm({ name: '', fatherName: '', motherName: '', gender: '', rollNumber: '', phone: '', email: '', password: '' });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Student could not be added';
      toast.error(msg, { id: loadingToast, duration: 6000 });
      if (onCreated) onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.form
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-secondary p-5 shadow-2xl sm:rounded-3xl sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <UserPlus size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black">Add student · Class {className}</h2>
                  <p className="mt-0.5 text-xs font-bold text-slate-500">
                    Name plus parent names keep the student unique
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="rounded-xl bg-white/5 p-2 text-slate-400 hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label} htmlFor="as-name">Full name</label>
                <input id="as-name" className={field} value={form.name} onChange={set('name')} placeholder="e.g. Rahul Kumar" maxLength={120} required />
              </div>

              <div>
                <label className={label} htmlFor="as-father">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> Father&apos;s name</span>
                </label>
                <input id="as-father" className={field} value={form.fatherName} onChange={set('fatherName')} placeholder="e.g. Ramesh Kumar" maxLength={80} />
              </div>

              <div>
                <label className={label} htmlFor="as-mother">Mother&apos;s name</label>
                <input id="as-mother" className={field} value={form.motherName} onChange={set('motherName')} placeholder="e.g. Sunita Devi" maxLength={80} />
              </div>

              <div>
                <label className={label} htmlFor="as-gender">Gender</label>
                <select id="as-gender" className={field} value={form.gender} onChange={set('gender')}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className={label} htmlFor="as-roll">Roll number</label>
                <input id="as-roll" className={field} value={form.rollNumber} onChange={set('rollNumber')} placeholder="e.g. SC12-014" maxLength={20} />
              </div>

              <div>
                <label className={label} htmlFor="as-phone">Phone (optional)</label>
                <input id="as-phone" type="tel" className={field} value={form.phone} onChange={set('phone')} placeholder="e.g. 98765 43210" maxLength={20} />
              </div>

              <div>
                <label className={label} htmlFor="as-email">Email (optional)</label>
                <input id="as-email" type="email" className={field} value={form.email} onChange={set('email')} placeholder="auto-generated" maxLength={254} />
              </div>

              <div className="sm:col-span-2">
                <label className={label} htmlFor="as-password">
                  Password <span className="normal-case text-slate-600">(optional — khaali chhodo to <span className="text-slate-400">Student@123</span>)</span>
                </label>
                <input id="as-password" className={field} value={form.password} onChange={set('password')} placeholder="Student ka login password" minLength={8} />
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 sm:col-span-2">
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs font-bold text-amber-200/90">
                  If a student with the same name and parents already exists, no duplicate is created — the existing account is reused.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-50 sm:col-span-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Add student
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddStudentModal;