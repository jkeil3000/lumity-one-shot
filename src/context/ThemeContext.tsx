import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeId = 'lumity' | 'midnight' | 'navy' | 'indigo' | 'stone';

interface ThemeInfo {
  id: ThemeId;
  name: string;
  subtitle: string;
}

export const themes: ThemeInfo[] = [
  { id: 'lumity', name: 'Light', subtitle: 'Original · clean & editorial' },
  { id: 'midnight', name: 'Dark', subtitle: 'Midnight Compass · focused' },
  { id: 'navy', name: 'Navy', subtitle: 'Midnight structure · blue mood' },
  { id: 'indigo', name: 'Indigo', subtitle: 'Midnight structure · violet-blue mood' },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  isTelos: boolean; // true for midnight or stone
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'lumity',
  setTheme: () => {},
  isTelos: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>('lumity');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isTelos: theme !== 'lumity' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
