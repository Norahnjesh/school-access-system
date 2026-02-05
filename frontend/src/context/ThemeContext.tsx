import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'school-access-theme'
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Get system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to document
  const applyTheme = (resolvedTheme: ResolvedTheme) => {
    const root = window.document.documentElement;
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    // Get stored theme or use default
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    const initialTheme = storedTheme || defaultTheme;
    
    setThemeState(initialTheme);
    
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = getSystemTheme();
        setResolvedTheme(newResolvedTheme);
        applyTheme(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Theme toggle component
interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (resolvedTheme === 'dark') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light theme';
      case 'dark': return 'Dark theme';
      case 'system': return 'System theme';
      default: return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 ${className}`}
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
    >
      {getIcon()}
    </button>
  );
};

// Theme-aware component wrapper
interface ThemeAwareProps {
  children: ReactNode;
  lightClass?: string;
  darkClass?: string;
}

export const ThemeAware: React.FC<ThemeAwareProps> = ({
  children,
  lightClass = '',
  darkClass = ''
}) => {
  const { resolvedTheme } = useTheme();
  
  const className = resolvedTheme === 'dark' ? darkClass : lightClass;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// School brand colors for both themes
export const schoolColors = {
  light: {
    primary: '#DC143C', // Crimson Red
    primaryHover: '#B91C3C',
    secondary: '#1e3a8a', // Navy Blue
    secondaryHover: '#1d4ed8',
    accent: '#059669', // Emerald
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
  dark: {
    primary: '#F87171', // Lighter red for dark mode
    primaryHover: '#EF4444',
    secondary: '#60a5fa', // Lighter blue for dark mode
    secondaryHover: '#3b82f6',
    accent: '#10b981', // Lighter emerald
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
  }
};

// Hook to get current school colors
export const useSchoolColors = () => {
  const { resolvedTheme } = useTheme();
  return schoolColors[resolvedTheme];
};

export default ThemeContext;
