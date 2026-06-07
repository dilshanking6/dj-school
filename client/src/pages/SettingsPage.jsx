import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Camera, CheckCircle, AlertCircle, Loader2, Mail, Phone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const SettingsPage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [profileData, setProfileData] = useState({ 
    email: user?.email || '', 
    phone: user?.phone || '', 
    avatarUrl: user?.avatar || '' 
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return setMessage({ type: 'error', text: 'New passwords do not match' });

    setLoading(true);
    try {
      await axios.post('/api/auth/change-password', {
        userId: user.id,
        oldPassword: passwords.old,
        newPassword: passwords.new
      });
      setMessage({ type: 'success', text: 'Security key updated!' });
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/update-profile', {
        userId: user.id,
        ...profileData
      });
      updateProfile({ ...user, ...profileData });
      setMessage({ type: 'success', text: 'Information updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8">Account Settings</h1>

      <div className="flex bg-white/5 p-1 rounded-2xl mb-8 gap-2 max-w-md">
        <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>General</button>
        <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Security</button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </motion.div>
      )}

      {activeTab === 'profile' ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-effect p-8 rounded-[2.5rem] border border-white/5">
          <form onSubmit={handleProfileUpdate} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="relative">
                <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/5">
                  {profileData.avatarUrl ? <img src={profileData.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={48} className="text-primary" />}
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg border-2 border-background"><Camera size={16} /></div>
              </div>
              <div className="flex-1 w-full space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Profile Picture URL</label>
                <input type="text" value={profileData.avatarUrl} onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-primary/50 transition-all text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-primary/50 transition-all text-sm" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="px-12 py-4 bg-primary rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-effect p-8 rounded-[2.5rem] border border-white/5 max-w-2xl">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Current Password</label>
              <input type="password" value={passwords.old} onChange={(e) => setPasswords({...passwords, old: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all text-sm" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">New Password</label>
              <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all text-sm" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-primary rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Update Security Key'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
