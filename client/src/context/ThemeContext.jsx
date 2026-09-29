import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'dj_theme';

export const ThemeContext = createContext(null);

/**
 * Pehli paint se pehle hi sahi theme lag jaaye, warna dark->light switch karte
 * hi ek safed flash dikhta hai. Isliye `index.html` me bhi wahi chhota inline
 * snippet theme ko turant set karta hai.
 */
const readInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage blocked ho to neeche system preference par jaate hain
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  root.style.colorScheme = theme;

  // Mobile ke browser chrome ko bhi theme ke saath match karwa do.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#EEF2F7' : '#0B1220');
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable — theme fir bhi is session me chalta rahega
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      // Colour change smooth lage, isliye ek chhota transition window.
      document.documentElement.classList.add('theme-transition');
      window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 220);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isLight: theme === 'light' }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
};
