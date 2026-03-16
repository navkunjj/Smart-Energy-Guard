import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-3 glass-card rounded-xl text-[var(--muted)] hover:text-blue-500 transition-all duration-300 flex items-center justify-center group"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;
