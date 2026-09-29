import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Chhota sa dark/light switch. Kisi bhi header/shell me daal do —
 * size `sm` (default) ya `md` me.
 */
const ThemeToggle = ({ className = '' }) => {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      className={`inline-flex items-center justify-center rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100 ${className}`}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeToggle;
