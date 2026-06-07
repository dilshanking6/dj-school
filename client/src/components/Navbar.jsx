import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Terms', path: '/terms' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isPortal = location.pathname.includes('/student') || 
                   location.pathname.includes('/teacher') || 
                   location.pathname.includes('/principal') || 
                   location.pathname.includes('/admin');

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isPortal ? 'glass-effect py-2 shadow-lg' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              DJ
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight leading-none">Digital <span className="text-primary">Janta</span></span>
              <span className="text-[8px] font-black text-gray-500 tracking-[0.2em] mt-1 uppercase">Smart School Portal</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {!isPortal && navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-6">
                  <Link to={`/${user.role.toLowerCase()}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-lg" alt="" /> : <User size={16} />}
                    </div>
                    {user.name.split(' ')[0]}
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-rose-400 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-blue-600 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                    Join School <Sparkles size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {!isPortal && navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-4 text-base font-bold text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/5 space-y-3">
                {user ? (
                  <>
                    <Link to={`/${user.role.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 text-center rounded-xl bg-primary/20 text-primary font-bold">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="block w-full py-4 text-center rounded-xl bg-rose-500/10 text-rose-500 font-bold">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 text-center rounded-xl border border-white/10 font-bold text-gray-400">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-4 text-center rounded-xl bg-primary font-bold">
                      Join School
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
