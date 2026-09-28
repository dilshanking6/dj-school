import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, BookOpen, Users, Award,
  Calendar, Settings, LogOut, Star, HelpCircle, ClipboardList,
  X, ShieldCheck, Home, GraduationCap, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const iconClass = 'w-[22px] h-[22px] shrink-0';

/** Static study site ka same-origin URL, user ki class ke saath. */
export const studyHref = (classNo) => {
  const cls = Number(classNo) >= 9 && Number(classNo) <= 12 ? Number(classNo) : 10;
  // index.html explicitly — dev me "/study/" React SPA fallback se home dikha deta hai
  return `/study/index.html?class=${cls}&locked=1`;
};

const studyItem = (name, classNo) => ({
  name,
  path: studyHref(classNo),
  icon: GraduationCap,
  external: true
});

const NAV = {
  student: (cls) => [
    { name: 'Overview', path: '/student', icon: LayoutDashboard, end: true },
    studyItem('Study Hub', cls),
    { name: 'Homework', path: '/student/homework', icon: BookOpen },
    { name: 'Attendance', path: '/student/attendance', icon: Users },
    { name: 'Results', path: '/student/results', icon: Award },
    { name: 'Rate Teachers', path: '/student/rating', icon: Star },
    { name: 'Messages', path: '/student/chat', icon: MessageSquare },
    { name: 'Events', path: '/student/events', icon: Calendar },
    { name: 'Complaints', path: '/student/complaints', icon: HelpCircle },
    { name: 'Settings', path: '/student/settings', icon: Settings }
  ],
  teacher: (cls) => [
    { name: 'Overview', path: '/teacher', icon: LayoutDashboard, end: true },
    studyItem('Study Hub', cls),
    { name: 'Attendance', path: '/teacher/attendance', icon: Users },
    { name: 'Study Material', path: '/teacher/homework', icon: BookOpen },
    { name: 'Results', path: '/teacher/results', icon: Award },
    { name: 'Messages', path: '/teacher/chat', icon: MessageSquare },
    { name: 'Events', path: '/teacher/events', icon: Calendar },
    { name: 'Settings', path: '/teacher/settings', icon: Settings }
  ],
  principal: (cls) => [
    { name: 'Overview', path: '/principal', icon: LayoutDashboard, end: true },
    studyItem('Study Hub', cls),
    { name: 'Manage Content', path: '/principal/study', icon: BookOpen },
    { name: 'Complaints', path: '/principal/complaints', icon: HelpCircle },
    { name: 'Attendance', path: '/principal/attendance', icon: Users },
    { name: 'Results', path: '/principal/results', icon: ClipboardList },
    { name: 'Messages', path: '/principal/chat', icon: MessageSquare },
    { name: 'Events', path: '/principal/events', icon: Calendar },
    { name: 'Settings', path: '/principal/settings', icon: Settings }
  ],
  admin: (cls) => [
    { name: 'Users', path: '/admin', icon: ShieldCheck, end: true },
    studyItem('Study Hub', cls),
    { name: 'Manage Content', path: '/admin/study', icon: BookOpen },
    { name: 'Messages', path: '/admin/chat', icon: MessageSquare },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ]
};

const getNav = (role, classNo) => (NAV[role] ? NAV[role](classNo) : NAV.student(10));

const PRIMARY_ICON = {
  student: Users,
  teacher: Users,
  principal: ClipboardList,
  admin: ShieldCheck
};

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-colors min-h-11 ${
    isActive ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
  }`;

const NavItems = ({ role, className = '', classNo, onNavigate = () => {} }) => {
  const { user } = useAuth();
  return (
    <nav className={`flex flex-col gap-1.5 ${className}`}>
      {getNav(role, classNo ?? user?.class).map(({ name, path, icon: Icon, end, external }) =>
        external ? (
          // Study Hub ko same tab me khula jaata hai (user flutter me portal
          // ka hissa samjhta hai) — naya tab nahi kholte.
          <a
            key={path}
            href={path}
            onClick={onNavigate}
            className={linkClasses({ isActive: false })}
          >
            <Icon className={iconClass} />
            <span className="truncate">{name}</span>
            <ArrowRight size={13} className="ml-auto shrink-0 opacity-50" />
          </a>
        ) : (
          <NavLink key={path} to={path} end={end} onClick={onNavigate} className={linkClasses}>
            <Icon className={iconClass} />
            <span className="truncate">{name}</span>
          </NavLink>
        )
      )}
    </nav>
  );
};

const Sidebar = ({ role, open, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/', { replace: true });
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-white/5 bg-secondary/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-black text-white">
              DJ
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white capitalize">{role} Portal</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Digital Janta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          <NavItems role={role} classNo={user?.class} onNavigate={onClose} />

          <div className="my-4 border-t border-white/5" />

          <NavLink to={`/${role}/settings`} onClick={onClose} className={linkClasses}>
            <Settings className={iconClass} />
            <span>Settings</span>
          </NavLink>

          <NavLink to="/" onClick={onClose} className={linkClasses}>
            <Home className={iconClass} />
            <span>School website</span>
          </NavLink>
        </div>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 min-h-11"
          >
            <LogOut className={iconClass} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const BottomNav = ({ role, onOpenMenu, classNo }) => {
  const { pathname } = useLocation();
  const all = getNav(role, classNo);
  // Bottom bar me external (Study Hub) link nahi - sirf app ke andar ke pages
  const items = all.filter((i) => !i.external).slice(0, 4);
  const Primary = PRIMARY_ICON[role] || LayoutDashboard;
  const moreActive = all
    .filter((i) => !i.external)
    .slice(items.length)
    .some(({ path }) => pathname === path);
  const columns = items.length + 1;

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-secondary/95 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`
            }
          >
            <Icon size={21} />
            <span className="max-w-full truncate px-1">{name}</span>
          </NavLink>
        ))}

        <button
          onClick={onOpenMenu}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
            moreActive ? 'text-primary' : 'text-slate-500'
          }`}
        >
          <Primary size={21} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
};

const DashboardShell = ({ role, children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-[100dvh]">
      <Sidebar role={role} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-[17rem] min-h-[100dvh] flex flex-col">
        <MobileTopBar role={role} onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 min-w-0 pb-[calc(4.5rem+var(--safe-bottom))] lg:pb-0">{children}</main>
      </div>

      <BottomNav role={role} onOpenMenu={() => setMenuOpen(true)} classNo={user?.class} />
    </div>
  );
};

const MobileTopBar = ({ role, onOpenMenu }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="lg:hidden sticky top-0 z-20 border-b border-white/5 bg-background/85 backdrop-blur-xl"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onOpenMenu}
          className="flex items-center gap-2.5 py-1.5 pr-3 -ml-1.5 rounded-xl"
          aria-label="Open navigation"
        >
          <span className="flex flex-col gap-[5px]">
            <span className="block h-[2px] w-5 rounded-full bg-slate-300" />
            <span className="block h-[2px] w-5 rounded-full bg-slate-300" />
            <span className="block h-[2px] w-3.5 rounded-full bg-slate-300" />
          </span>
          <span className="text-sm font-bold capitalize text-white">{role}</span>
        </button>

        <button
          onClick={() => navigate(`/${user?.role?.toLowerCase() || role}`)}
          className="flex items-center gap-2.5 py-1.5 pl-2 -mr-1.5 rounded-xl"
        >
          <span className="text-sm font-semibold text-slate-300 max-w-[10rem] truncate">
            {user?.name}
          </span>
          <span className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-primary">
                {(user?.name || 'D').charAt(0).toUpperCase()}
              </span>
            )}
          </span>
        </button>
      </div>
    </header>
  );
};

export default DashboardShell;
export { NavItems };
