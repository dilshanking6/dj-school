import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const PORTAL_ROOTS = ['/student', '/teacher', '/principal', '/admin'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const inPortal = PORTAL_ROOTS.some((root) => location.pathname.startsWith(root));
  const solid = scrolled;

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Platform', path: '/#features' },
    { name: 'Terms', path: '/terms' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const dashboardPath = user ? `/${user.role.toLowerCase()}` : '/login';

  // Portal ke andar DashboardShell apna sidebar aur mobile top bar deta hai,
  // isliye global navbar duplicate na ho, use render nahi karte.
  if (inPortal) return null;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? 'glass-effect border-b border-white/5 shadow-lg' : 'bg-transparent'}`}
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${solid ? 'py-2.5' : 'py-4'}`}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs lg:text-sm font-black text-white shrink-0">
              DJ
            </span>
            <span className="min-w-0">
              <span className="block text-base lg:text-lg font-extrabold leading-none tracking-tight truncate">
                Digital <span className="text-primary">Janta</span>
              </span>
              <span className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">
                Janta +2 High School
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/5"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-primary" />
                    )}
                  </span>
                  <span className="text-sm font-bold max-w-[9rem] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 transition-colors hover:text-rose-400 hover:bg-white/5"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:text-white">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-primary text-sm font-bold text-white transition-all hover:bg-blue-600 glow-shadow"
                >
                  Create account
                </Link>
              </div>
            )}
            <ThemeToggle className="-mr-1" />
          </div>

          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="lg:hidden p-2.5 -mr-2 rounded-xl text-white"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden border-t border-white/5 glass-effect"
          >
            <div className="px-4 py-4 space-y-1" style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Appearance</span>
                <ThemeToggle />
              </div>
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.name}
                  <ChevronRight size={18} className="text-slate-600" />
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/5"
                  >
                    <span className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate">{user.name}</span>
                      <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        {user.role}
                      </span>
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/10"
                  >
                    <LogOut size={20} />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    className="rounded-2xl border border-white/10 py-3.5 text-center text-sm font-bold text-slate-300"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-primary py-3.5 text-center text-sm font-bold text-white"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
