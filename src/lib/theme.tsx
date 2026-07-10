/**
 * Theme Provider - Dark Mode Support
 *
 * Provides theme context and toggle functionality for dark/light mode
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Resolve system theme
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve effective theme
  const resolveTheme = (theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  };

  // Apply theme to document
  const applyTheme = (resolved: 'light' | 'dark') => {
    const root = document.documentElement;

    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setResolvedTheme(resolved);
  };

  // Initialize theme
  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('cp_theme') as Theme | null;
    const initial = stored || defaultTheme;

    setThemeState(initial);
    applyTheme(resolveTheme(initial));
  }, [defaultTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Set theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('cp_theme', newTheme);
    applyTheme(resolveTheme(newTheme));
  };

  // Toggle theme
  const toggleTheme = () => {
    const current = resolvedTheme;
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Hook to require specific theme
export function useRequireTheme(required: 'light' | 'dark') {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === required;
}
