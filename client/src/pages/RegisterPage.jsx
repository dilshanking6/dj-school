import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Hash, BookOpen, ArrowRight, Phone, Award, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = ({ role = 'student' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    className: '',
    rollNumber: '',
    subject: '',
    isClassTeacher: 'No',
    classesHandled: [],
    degree: '',
    experience: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/register', { ...formData, role });
      alert(`${role.toUpperCase()} Registered Successfully! Please Login.`);
      navigate(role === 'student' ? '/login' : `/${role}-panel`);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        className="w-full max-w-2xl"
      >
        <div className="glass-effect rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 capitalize">{role} Registration</h2>
            <p className="text-gray-400">Official Portal for Janta +2 High School</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input name="name" type="text" onChange={handleChange} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input name="email" type="email" onChange={handleChange} placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input name="phone" type="tel" onChange={handleChange} placeholder="+91" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
              {role === 'student' ? (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Roll Number</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input name="rollNumber" type="text" onChange={handleChange} placeholder="Roll No" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Educational Degree</label>
                  <div className="relative group">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input name="degree" type="text" onChange={handleChange} placeholder="e.g. B.Ed, M.A." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                </div>
              )}
            </div>

            {role === 'student' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Select Class</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                  <select name="className" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all appearance-none text-sm" required>
                    <option value="" className="bg-background">Select Class</option>
                    <option value="9" className="bg-background">Class 9</option>
                    <option value="10" className="bg-background">Class 10</option>
                    <option value="11" className="bg-background">Class 11</option>
                    <option value="12" className="bg-background">Class 12</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'teacher' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Primary Subject</label>
                    <input name="subject" type="text" onChange={handleChange} placeholder="Math, Science, etc." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Class Teacher?</label>
                    <select name="isClassTeacher" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm bg-background">
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Classes You Handle</label>
                  <div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    {['9', '10', '11', '12'].map(c => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.classesHandled.includes(c)} onChange={() => handleCheckbox(c)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary" />
                        <span className="text-sm font-bold">Class {c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'principal' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Years of Experience</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                  <input name="experience" type="number" onChange={handleChange} placeholder="Years" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                <input name="password" type="password" onChange={handleChange} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm" required />
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary" required />
              <span className="text-gray-400 text-xs">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link></span>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-primary rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-95 transition-all glow-shadow flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Creating Account...' : <>Complete Registration <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link to={role === 'student' ? '/login' : `/${role}-panel`} className="text-primary font-bold hover:underline">Login here</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
