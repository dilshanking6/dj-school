import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

/**
 * Purana sidebar hata diya gaya hai. Ab har role ka navigation
 * DashboardShell ke andar hai (desktop sidebar + mobile drawer + bottom nav).
 * Ye component sirf logout action ke liye bacha hai, taaki purane
 * imports bhi toot na sakein.
 */
const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
    >
      <LogOut size={20} />
      Sign out
    </button>
  );
};

export default Sidebar;
