import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Phone, Key, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const panel = 'w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-colors text-sm placeholder:text-slate-500';

const LoginPage = ({ role = 'student', title = 'Sign in' }) => {
  const [method, setMethod] = useState('email');
  const [stage, setStage] = useState('credentials');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, requestOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const otpInput = useRef(null);

  const registerPath =
    role === 'student' ? '/register' : role === 'teacher' ? '/teacher-register' : null;

  useEffect(() => {
    if (stage === 'otp') otpInput.current?.focus();
  }, [stage]);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  const requestCode = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.phone.trim()) {
      setError('Enter the email and mobile number on your school record');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await requestOtp(form.email.trim(), form.phone.trim());
      setStage('otp');
      setInfo(res.devCode ? `Development mode: your code is ${res.devCode}` : 'A 6-digit code has been sent to your mobile.');
    } catch (err) {
      setError(err.message || 'Unable to send a verification code');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const nextUser =
        method === 'email'
          ? await login({ email: form.email.trim(), password: form.password, role })
          : await login({ phone: form.phone.trim(), otp: form.otp.trim(), role });
      navigate(`/${nextUser.role.toLowerCase()}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
      if (method === 'phone') setStage('credentials');
    } finally {
      setLoading(false);
    }
  };

  const switchMethod = (next) => {
    setMethod(next);
    setStage('credentials');
    setError('');
    setInfo('');
    setForm((prev) => ({ ...prev, phone: '', otp: '' }));
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px] lg:h-96 lg:w-96" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-accent/20 blur-[100px] lg:h-96 lg:w-96" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-9">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm capitalize text-slate-400">{role} portal</p>
          </div>

          {role !== 'admin' && (
            <div className="mb-7 flex gap-1 rounded-2xl bg-white/5 p-1">
              {[
                { id: 'email', label: 'Email' },
                { id: 'phone', label: 'Mobile code' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchMethod(item.id)}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    method === item.id ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
              {info}
            </div>
          )}

          <form
            onSubmit={method === 'email' || stage === 'otp' ? submit : requestCode}
            className="space-y-4"
          >
            <AnimatePresence mode="wait" initial={false}>
              {method === 'email' ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="Email address"
                      autoComplete="email"
                      className={panel}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Password"
                      autoComplete="current-password"
                      className={panel}
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="Email on your school record"
                      autoComplete="email"
                      className={panel}
                      required
                      disabled={stage === 'otp'}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="Registered mobile number"
                      autoComplete="tel"
                      inputMode="tel"
                      className={panel}
                      required
                      disabled={stage === 'otp'}
                    />
                  </div>

                  {stage === 'otp' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        ref={otpInput}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.otp}
                        onChange={set('otp')}
                        placeholder="6-digit code"
                        autoComplete="one-time-code"
                        className={`${panel} tracking-[0.35em] font-bold`}
                        required
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {method === 'phone' && stage === 'otp' && (
              <button
                type="button"
                onClick={() => {
                  setStage('credentials');
                  setForm((prev) => ({ ...prev, otp: '' }));
                  setInfo('');
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 transition-colors hover:text-white"
              >
                <ArrowLeft size={14} />
                Use a different number
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white transition-all active:scale-[0.99] glow-shadow disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {method === 'phone' && stage === 'credentials' ? 'Send verification code' : 'Sign in'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {registerPath && (
            <p className="mt-7 text-center text-sm text-slate-500">
              Need an account?{' '}
              <Link to={registerPath} className="font-bold text-primary hover:underline">
                Register as {role}
              </Link>
            </p>
          )}

          {role === 'teacher' && (
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
              Teaching accounts are activated by the school office before first sign in.
            </p>
          )}

          {role === 'admin' && (
            <p className="mt-7 text-center text-xs leading-relaxed text-slate-500">
              Administrator accounts are created by the system operator.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
