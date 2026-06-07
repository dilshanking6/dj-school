import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Hash, BookOpen, ArrowRight, Phone, Award, Briefcase, Users, Camera, Plus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RegisterPage = ({ role = 'student' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    className: '',
    section: 'A',
    motherName: '',
    fatherName: '',
    rollNumber: '',
    subject: '',
    isClassTeacher: 'No',
    classesHandled: [],
    degree: '',
    experience: '',
    password: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Creating account...');
    try {
      await axios.post('/api/auth/register', { ...formData, role });
      toast.success(`${role.toUpperCase()} Registered Successfully!`, { id: loadingToast });
      navigate(role === 'student' ? '/login' : `/${role}-panel`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20000) {
        toast.error('DP too large! Max 20KB for Google Sheets.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleCheckbox = (val) => {
    const current = formData.classesHandled;
    if (current.includes(val)) {
      setFormData({...formData, classesHandled: current.filter(c => c !== val)});
    } else {
      setFormData({...formData, classesHandled: [...current, val]});
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 blur-[100px] rounded-full -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="glass-effect rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-2 capitalize">{role} Registration</h2>
            <p className="text-gray-400">Join the Janta +2 High School Digital Community</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            {/* DP Upload */}
            <div className="flex justify-center mb-8">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="DP" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-gray-500 group-hover:text-primary transition-colors" size={32} />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Plus size={14} className="text-white" />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                  <input name="firstName" type="text" onChange={handleChange} placeholder="First Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                  <input name="lastName" type="text" onChange={handleChange} placeholder="Last Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                  <input name="email" type="email" onChange={handleChange} placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                  <input name="phone" type="tel" onChange={handleChange} placeholder="+91" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
            </div>

            {role === 'student' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Father's Name</label>
                    <input name="fatherName" type="text" onChange={handleChange} placeholder="Father's Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Mother's Name</label>
                    <input name="motherName" type="text" onChange={handleChange} placeholder="Mother's Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Class</label>
                    <select name="className" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 bg-background text-sm" required>
                      <option value="">Select</option>
                      {['9', '10', '11', '12'].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Section</label>
                    <select name="section" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 bg-background text-sm" required>
                      {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Roll Number</label>
                    <input name="rollNumber" type="text" onChange={handleChange} placeholder="Roll No" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                </div>
              </>
            )}

            {role === 'teacher' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Educational Degree</label>
                    <input name="degree" type="text" onChange={handleChange} placeholder="e.g. B.Ed, M.A." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Primary Subject</label>
                    <input name="subject" type="text" onChange={handleChange} placeholder="Math, Science, etc." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Classes You Handle</label>
                  <div className="flex flex-wrap gap-4 p-5 bg-white/5 rounded-[1.5rem] border border-white/10">
                    {['9', '10', '11', '12'].map(c => (
                      <label key={c} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.classesHandled.includes(c)} onChange={() => handleCheckbox(c)} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary/50" />
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">Class {c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                <input name="password" type="password" onChange={handleChange} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-primary rounded-3xl font-black text-lg hover:scale-[1.01] active:scale-95 transition-all glow-shadow flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <>Complete Registration <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-gray-500">
            Already have an account? <Link to={role === 'student' ? '/login' : `/${role}-panel`} className="text-primary font-bold hover:underline">Login here</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
