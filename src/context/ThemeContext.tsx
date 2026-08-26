import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('ag_utopia_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark', 'theme-dark');
      root.classList.add('light', 'theme-light');
      document.body.classList.remove('theme-dark', 'bg-[#000000]', 'text-slate-100');
      document.body.classList.add('theme-light', 'bg-[#f8fafc]', 'text-slate-900');
    } else {
      root.classList.remove('light', 'theme-light');
      root.classList.add('dark', 'theme-dark');
      document.body.classList.remove('theme-light', 'bg-[#f8fafc]', 'text-slate-900');
      document.body.classList.add('theme-dark', 'bg-[#000000]', 'text-slate-100');
    }
    try {
      localStorage.setItem('ag_utopia_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
