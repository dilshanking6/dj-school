import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, CheckCircle, AlertCircle, Loader2, Mail, Phone, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MAX_AVATAR_BYTES = 8000;

const field = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-primary/50';
const label = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500';

const TABS = [
  { key: 'profile', label: 'General' },
  { key: 'security', label: 'Password' }
];

const SettingsPage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const fileInput = useRef(null);

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Choose an image under 8 KB, or leave your photo unchanged');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfileData((prev) => ({ ...prev, avatar: reader.result }));
    reader.onerror = () => toast.error('That image could not be read');
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Updating password');
    try {
      await axios.post('/api/auth/change-password', {
        oldPassword: passwords.old,
        newPassword: passwords.new
      });
      setPasswords({ old: '', new: '', confirm: '' });
      toast.success('Password updated', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password could not be updated', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Saving changes');
    try {
      const res = await axios.post('/api/auth/update-profile', {
        email: profileData.email,
        phone: profileData.phone,
        avatarUrl: profileData.avatar
      });
      const saved = res.data?.user;
      if (saved) {
        setProfileData({
          email: saved.email || profileData.email,
          phone: saved.phone || profileData.phone,
          avatar: saved.avatar || profileData.avatar
        });
        updateProfile({ ...user, ...saved });
      }
      toast.success('Profile updated', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Profile could not be updated', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-black sm:mb-8 sm:text-3xl">Account settings</h1>

      <div className="mb-6 flex max-w-sm gap-1 rounded-2xl bg-white/5 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              activeTab === tab.key ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleProfileUpdate}
          className="glass-effect space-y-6 rounded-3xl border border-white/5 p-5 sm:p-7"
        >
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/5 bg-primary/20">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Your profile photo" className="h-full w-full object-cover" />
                ) : (
                  <User className="text-primary" size={36} />
                )}
              </div>

              <AnimatePresence>
                {profileData.avatar && (
                  <button
                    type="button"
                    onClick={() => setProfileData((prev) => ({ ...prev, avatar: '' }))}
                    className="absolute -right-1 -top-1 rounded-full border-2 border-background bg-rose-500 p-1.5 text-white"
                    aria-label="Remove profile photo"
                  >
                    <X size={13} />
                  </button>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-full border-2 border-background bg-primary p-2.5 text-white"
                aria-label="Change profile photo"
              >
                <Camera size={15} />
              </button>
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black">{user?.name}</p>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                {user?.role}
                {user?.class && user.class !== 'N/A' ? ` · Class ${user.class}` : ''}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Photos under 8 KB keep the portal fast on mobile data.
              </p>
            </div>

            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="settings-email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  id="settings-email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={`${field} pl-11`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={label} htmlFor="settings-phone">Phone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  id="settings-phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className={`${field} pl-11`}
                  required
                />
              </div>
            </div>
          </div>

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
            <AlertCircle className="mt-0.5 shrink-0" size={13} />
            Changing your phone number also changes the number used for one-time sign-in codes.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            Save changes
          </button>
        </motion.form>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handlePasswordChange}
          className="glass-effect space-y-5 rounded-3xl border border-white/5 p-5 sm:p-7"
        >
          <div>
            <label className={label} htmlFor="old-password">Current password</label>
            <input
              id="old-password"
              type="password"
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
              className={field}
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label className={label} htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className={field}
              autoComplete="new-password"
              required
            />
            <p className="mt-2 text-[11px] text-slate-500">At least 8 characters, with letters and numbers.</p>
          </div>

          <div>
            <label className={label} htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className={field}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <User size={18} />}
            Update password
          </button>
        </motion.form>
      )}
    </div>
  );
};

export default SettingsPage;
