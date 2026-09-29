import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, BookOpen, ArrowRight, Phone, GraduationCap,
  Camera, Plus, Loader2, ChevronLeft, BadgeCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useOtpChannels from '../hooks/useOtpChannels';

const field = 'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 outline-none focus:border-primary/50 transition-colors text-sm placeholder:text-slate-500';

const label = 'block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2';

// Server ke `validate.js` wahi rules yahan mirror karte hain, taaki user ko
// type karte hi pata chale password kitna strong hai.
const PASSWORD_RULES = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'A letter (a-z)', test: (value) => /[a-zA-Z]/.test(value) },
  { label: 'A number (0-9)', test: (value) => /[0-9]/.test(value) },
  { label: 'A symbol (@ # _)', test: (value) => /[^a-zA-Z0-9]/.test(value) }
];

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
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [proof, setProof] = useState('');
  const [devCode, setDevCode] = useState('');
  const [channel, setChannel] = useState('email');
  const otpInputRef = useRef(null);
  const navigate = useNavigate();

  const loginPath = role === 'student' ? '/login' : `/${role}-login`;

  // Server par kaunsa OTP channel sach me chalta hai (SMTP / SMS set hai ya
  // nahi). Jo nahi chalta, uska tab chhup jaata hai — user ko bekaar click
  // karne aur phir server ke error se nahi jana padta.
  const channels = useOtpChannels();
  // `useOtpChannels` mobile ko `sms` key ke naam se deta hai (server bhi wahi
  // bolta hai), isliye yahan `phone` ki jagah `sms` dekhna zaroori hai. Pehle
  // `channels[id]` likha tha jisse `channels.phone` undefined ho jata tha —
  // aur jab tak email configured nahi tha, `working` khali rehne ki wajah se
  // dono tabs backup list se aa jaate the. Email set karte hi mobile tab gayab
  // ho gaya, bina koi server side kami ke.
  const working = useMemo(
    () => [
      ['email', channels.email?.available],
      ['phone', channels.sms?.available]
    ].filter(([, available]) => available).map(([id]) => id),
    [channels.email?.available, channels.sms?.available]
  );

  // Dono hi channel band ho to koi "sab theek hai" jhooth nahi bolenge —
  // dono dikh jaenge aur server ka saaf error dikhega, jo asli wajah batata hai.
  const tabs = working.length ? working : ['email', 'phone'];
  const channelBlocked = working.length > 0 && !working.includes(channel);

  useEffect(() => {
    if (working.length && !working.includes(channel)) setChannel(working[0]);
  }, [working, channel]);

  // Code jis channel se maanga gaya, usi par verify hoga.
  const otpTarget = channel === 'email' ? { key: 'email', value: form.email } : { key: 'phone', value: form.phone };
  const otpReady = otpTarget.value.trim().length >= 5;
  const codeSentFor = otpTarget.value.trim().toLowerCase();
  const codeLive = otpSent === codeSentFor;

  // Verification hamesha usi value par valid hai jis par code bana tha —
  // email ya number badla to proof wapas chala jaata hai.
  useEffect(() => {
    setVerified(false);
    setProof('');
    setOtpCode('');
    setOtpSent('');
    setDevCode('');
  }, [codeSentFor]);

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

  const sendOtp = async () => {
    if (channelBlocked) {
      setError('Ye option abhi kaam nahi kar raha. Doosra try karo.');
      return;
    }
    if (!otpTarget.value.trim()) {
      setError(channel === 'email' ? 'Pehle email address likho.' : 'Pehle mobile number likho.');
      return;
    }
    setOtpLoading(true);
    setError('');
    setVerified(false);
    setProof('');
    setOtpCode('');
    setDevCode('');
    try {
      const { data } = await axios.post(`/api/auth/${channel}-otp/request`, {
        [otpTarget.key]: otpTarget.value.trim()
      });
      setOtpSent(codeSentFor);
      setDevCode(data.devCode || '');
      otpInputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Code bhej nahi paaya. Dobara try karo.');
    } finally {
      setOtpLoading(false);
    }
  };

  // `codeArg` se turant verify ho jaata hai (6 digit bharte hi), warna
  // state se padha jaata hai (Verify button dabane par).
  const verifyOtp = async (codeArg) => {
    const code = String(codeArg ?? otpCode);
    if (code.length !== 6) {
      setError('6 digit ka code likho.');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      const { data } = await axios.post(`/api/auth/${channel}-otp/verify`, {
        [otpTarget.key]: otpTarget.value.trim(),
        code
      });
      setProof(data.proof);
      setVerified(true);
      setDevCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Code galat hai.');
    } finally {
      setVerifying(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!verified) {
      setError('Account banne se pehle email ya mobile verify karo.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', { ...form, role, avatar, proof });
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
                <label className={label} htmlFor="email">Email address (Gmail)</label>
                <IconField
                  id="email"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  required
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Sirf asli Gmail chalega — account banne se pehle verify bhi karna hoga.
                </p>
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

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex gap-2">
                {[
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'phone', label: 'Mobile', icon: Phone }
                ]
                  .filter((option) => tabs.includes(option.id))
                  .map((option) => {
                    const active = channel === option.id;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => { setChannel(option.id); setError(''); setOtpCode(''); setDevCode(''); }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                          active
                            ? 'border-primary/50 bg-primary/15 text-white'
                            : 'border-white/10 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <Icon size={16} />
                        {option.label}
                      </button>
                    );
                  })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className={label} htmlFor="codeOtp">
                    {channel === 'email' ? 'Email verification code' : 'Mobile verification code'}
                  </label>
                  <input
                    id="codeOtp"
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(event) => {
                      const next = event.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(next);
                      setError('');
                      // 6 digit bharte hi seedha verify — button dabaya karne ki zaroorat nahi.
                      if (next.length === 6 && codeLive) verifyOtp(next);
                    }}
                    placeholder={verified ? 'Verified' : '6-digit code'}
                    className={`${field} tracking-[0.35em] ${verified ? 'opacity-70' : ''}`}
                    disabled={verified}
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {verified
                      ? `${channel === 'email' ? 'Email' : 'Mobile'} verify ho gaya.`
                      : codeLive
                        ? `Code ${otpTarget.value.trim()} pe bheja gaya hai — yahan likho.`
                        : `Pehle ${channel === 'email' ? 'email pe' : 'mobile pe'} code bhejo.`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-sm font-bold text-emerald-400">
                      <BadgeCheck size={18} /> Verified
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otpLoading || !otpReady || channelBlocked}
                        className="rounded-2xl border border-white/10 px-4 py-3.5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-40"
                      >
                        {otpLoading ? <Loader2 size={16} className="animate-spin" /> : codeLive ? 'Resend' : 'Send code'}
                      </button>
                      <button
                        type="button"
                        onClick={() => verifyOtp()}
                        disabled={verifying || otpCode.length !== 6}
                        className="rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
                      >
                        {verifying ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {devCode && (
                <button
                  type="button"
                  onClick={() => { setOtpCode(devCode); setError(''); }}
                  className="mt-2 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left text-[11px] font-bold text-amber-400"
                >
                  Development code: {devCode} — tap to fill
                </button>
              )}
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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className={`${field} pl-12`}
                  minLength={8}
                  required
                />
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(form.password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 ${ok ? 'text-emerald-400' : 'text-slate-500'}`}
                    >
                      {ok ? <BadgeCheck size={13} /> : <span className="inline-block h-[13px] w-[13px] rounded-full border border-current" />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
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
