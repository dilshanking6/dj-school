import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Phone, Key, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = ({ role = 'student', title = 'Welcome Back' }) => {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({ email: '', password: '', phone: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(
        method === 'email' ? formData.email : null,
        method === 'email' ? formData.password : null,
        role,
        method === 'phone' ? formData.phone : null,
        method === 'phone' ? formData.otp : null
      );
      navigate(`/${user.role.toLowerCase()}`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = (e) => {
    e.preventDefault();
    if (!formData.phone) return setError('Please enter phone number');
    setShowOtp(true);
    setError('');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 blur-[100px] rounded-full -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">{title}</h2>
            <p className="text-gray-400 capitalize">{role} Authentication</p>
          </div>

          {role !== 'admin' && (
            <div className="flex bg-white/5 p-1 rounded-xl mb-8 gap-2">
              <button 
                onClick={() => {setMethod('email'); setShowOtp(false);}}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'email' ? 'bg-primary text-white' : 'text-gray-500'}`}
              >
                Email
              </button>
              <button 
                onClick={() => setMethod('phone')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'phone' ? 'bg-primary text-white' : 'text-gray-500'}`}
              >
                Phone + OTP
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={method === 'email' || showOtp ? handleLogin : requestOtp} className="space-y-6">
            <AnimatePresence mode="wait">
              {method === 'email' ? (
                <motion.div key="email" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Official Email"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Security Password"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="space-y-4">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Registered Mobile"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
                        required
                        disabled={showOtp}
                      />
                    </div>
                    {showOtp && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          type="text" 
                          value={formData.otp}
                          onChange={(e) => setFormData({...formData, otp: e.target.value})}
                          placeholder="Enter 6-Digit OTP"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
                          required
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all glow-shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>
                {method === 'phone' && !showOtp ? 'Request Security Code' : 'Verify & Access Portal'} <ArrowRight size={20} />
              </>}
            </button>
          </form>

          {role !== 'admin' && (
            <div className="mt-8 text-center space-y-4">
              <p className="text-gray-500 text-sm">
                Need an account? <Link to={role === 'student' ? '/register' : `/${role}-register`} className="text-primary font-bold hover:underline">Register as {role}</Link>
              </p>
              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Shield size={10} /> Secure SSL Encrypted Session
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
