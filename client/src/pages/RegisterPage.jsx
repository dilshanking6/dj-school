import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, BookOpen, ArrowRight, Phone, GraduationCap,
  Camera, Plus, Loader2, ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const field = 'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 outline-none focus:border-primary/50 transition-colors text-sm placeholder:text-slate-500';

const label = 'block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2';

const IconField = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
    <input {...props} className={`${field} pl-12`} />
  </div>
);

const RegisterPage = ({ role = 'student' }) => {
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', className: '9', section: 'A', rollNumber: '',
    fatherName: '', motherName: '',
    subject: '', degree: '', experience: 0
  });
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginPath = role === 'student' ? '/login' : `/${role}-login`;

  const title = useMemo(() => {
    if (isStudent) return 'Student registration';
    if (isTeacher) return 'Teacher registration';
    return 'Principal registration';
  }, [isStudent, isTeacher]);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 20000) {
      setError('Choose an image under 20 KB');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', { ...form, role, avatar });
      navigate(loginPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px] lg:h-96 lg:w-96" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-[100px] lg:h-96 lg:w-96" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-effect rounded-3xl border border-white/10 p-5 shadow-2xl sm:p-9">
          <Link
            to={loginPath}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-white"
          >
            <ChevronLeft size={16} />
            Back to sign in
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {isStudent
                ? 'Create your account to access attendance, results and study material.'
                : 'Teaching staff accounts are activated by the school office after verification.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="flex justify-center">
              <label className="group relative cursor-pointer">
                <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/15 bg-white/5 transition-colors group-hover:border-primary/50 sm:h-24 sm:w-24">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Camera size={26} className="text-slate-500 transition-colors group-hover:text-primary" />
                  )}
                </span>
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                  <Plus size={15} />
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="firstName">First name</label>
                <IconField
                  id="firstName"
                  icon={User}
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder="First name"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div>
                <label className={label} htmlFor="lastName">Last name</label>
                <IconField
                  id="lastName"
                  icon={User}
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="Last name"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="email">Email address</label>
                <IconField
                  id="email"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@school.edu"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className={label} htmlFor="phone">Mobile number</label>
                <IconField
                  id="phone"
                  icon={Phone}
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="Registered number"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="fatherName">Father's name</label>
                <input
                  id="fatherName"
                  value={form.fatherName}
                  onChange={set('fatherName')}
                  placeholder="Father's name"
                  className={field}
                  required
                />
              </div>
              <div>
                <label className={label} htmlFor="motherName">Mother's name</label>
                <input
                  id="motherName"
                  value={form.motherName}
                  onChange={set('motherName')}
                  placeholder="Mother's name"
                  className={field}
                  required
                />
              </div>
            </div>

            {isStudent ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className={label} htmlFor="className">Class</label>
                  <select id="className" value={form.className} onChange={set('className')} className={`${field} bg-secondary`} required>
                    {['9', '10', '11', '12'].map((item) => (
                      <option key={item} value={item}>Class {item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="section">Section</label>
                  <select id="section" value={form.section} onChange={set('section')} className={`${field} bg-secondary`} required>
                    {['A', 'B', 'C', 'D'].map((item) => (
                      <option key={item} value={item}>Section {item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="rollNumber">Roll number</label>
                  <input id="rollNumber" value={form.rollNumber} onChange={set('rollNumber')} placeholder="Roll no" className={field} required />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={label} htmlFor="subject">Subject</label>
                  <IconField
                    id="subject"
                    icon={BookOpen}
                    value={form.subject}
                    onChange={set('subject')}
                    placeholder="Subject you teach"
                    required={isTeacher}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="experience">Years of experience</label>
                  <input
                    id="experience"
                    type="number"
                    min={0}
                    max={60}
                    value={form.experience}
                    onChange={set('experience')}
                    className={field}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={label} htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 8 characters, with a number"
                  autoComplete="new-password"
                  className={`${field} pl-12`}
                  minLength={8}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Use at least 8 characters and include both letters and numbers.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white transition-all active:scale-[0.99] glow-shadow disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-500">
            <GraduationCap size={16} />
            <span>
              Already registered?{' '}
              <Link to={loginPath} className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
