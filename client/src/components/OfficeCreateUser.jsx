import React, { useState } from 'react';
import { UserPlus, Loader2, KeyRound, Eye, EyeOff, Users, BookOpen } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

const ROLE_ALLOW = {
  admin: [
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' },
    { value: 'principal', label: 'Principal' }
  ],
  principal: [
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' }
  ]
};

/**
 * Principal / Admin office account banane ka form.
 * Password yahin set hota hai — office usi ko batata hai user ko.
 */
const OfficeCreateUser = ({ role, onCreated, compact }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: (ROLE_ALLOW[role] || ROLE_ALLOW.admin)[0].value,
    password: '',
    className: '9',
    subject: '',
    gender: '',
    section: 'A',
    phone: '',
    fatherName: '',
    motherName: '',
    rollNumber: ''
  });

  const allowed = ROLE_ALLOW[role] || ROLE_ALLOW.admin;
  const needsClass = form.role === 'teacher' || form.role === 'student';

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading('Creating account');
    try {
      await axios.post('/api/school/users', form);
      toast.success(`${form.role} account created`, { id: loadingToast });
      setForm((f) => ({ ...f, name: '', email: '', password: '', phone: '' }));
      if (onCreated) onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Account could not be created', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={compact ? '' : 'rounded-3xl border border-white/5 bg-white/[0.03] p-5 sm:p-6'}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2.5 font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <UserPlus size={18} />
          </span>
          Create account
        </span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''} text-slate-500`}>▾</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="oc-name">Full name</label>
            <input id="oc-name" className={field} value={form.name} onChange={set('name')} placeholder="e.g. Asha Devi" maxLength={120} required />
          </div>

          <div>
            <label className={label} htmlFor="oc-email">Email</label>
            <input id="oc-email" type="email" className={field} value={form.email} onChange={set('email')} placeholder="name@example.com" maxLength={254} required />
          </div>

          <div>
            <label className={label} htmlFor="oc-role">Account type</label>
            <select id="oc-role" className={field} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {allowed.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label} htmlFor="oc-password">
              <span className="inline-flex items-center gap-1"><KeyRound size={12} /> Password</span>
            </label>
            <div className="relative">
              <input
                id="oc-password"
                type={showPwd ? 'text' : 'password'}
                className={`${field} pr-12`}
                value={form.password}
                onChange={set('password')}
                placeholder="Min 8 letters + numbers"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Share this password with them — it is what they sign in with.</p>
          </div>

          {needsClass && (
            <div>
              <label className={label} htmlFor="oc-class">Class</label>
              <select id="oc-class" className={field} value={form.className} onChange={set('className')}>
                {['9', '10', '11', '12'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          )}

          {form.role === 'teacher' && (
            <div>
              <label className={label} htmlFor="oc-subject">
                <span className="inline-flex items-center gap-1"><BookOpen size={12} /> Subject</span>
              </label>
              <input id="oc-subject" className={field} value={form.subject} onChange={set('subject')} placeholder="e.g. Physics" maxLength={60} required />
            </div>
          )}

          <div>
            <label className={label} htmlFor="oc-gender">Gender</label>
            <select id="oc-gender" className={field} value={form.gender} onChange={set('gender')}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className={label} htmlFor="oc-phone">
              <span className="inline-flex items-center gap-1"><Users size={12} /> Phone (optional)</span>
            </label>
            <input id="oc-phone" type="tel" className={field} value={form.phone} onChange={set('phone')} placeholder="e.g. 98765 43210" maxLength={20} />
          </div>

          {form.role === 'student' && (
            <>
              <div>
                <label className={label} htmlFor="oc-father">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> Father&apos;s name</span>
                </label>
                <input id="oc-father" className={field} value={form.fatherName} onChange={set('fatherName')} placeholder="e.g. Ramesh Kumar" maxLength={80} />
              </div>

              <div>
                <label className={label} htmlFor="oc-mother">Mother&apos;s name</label>
                <input id="oc-mother" className={field} value={form.motherName} onChange={set('motherName')} placeholder="e.g. Sunita Devi" maxLength={80} />
              </div>

              <div>
                <label className={label} htmlFor="oc-roll">Roll number</label>
                <input id="oc-roll" className={field} value={form.rollNumber} onChange={set('rollNumber')} placeholder="e.g. SC11-007" maxLength={20} />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Create {form.role} account
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OfficeCreateUser;