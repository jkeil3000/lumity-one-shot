import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeId = 'lumity' | 'midnight' | 'stone';

interface ThemeInfo {
  id: ThemeId;
  name: string;
  subtitle: string;
}

export const themes: ThemeInfo[] = [
  { id: 'lumity', name: 'Lumity', subtitle: 'Original — warm & editorial' },
  { id: 'midnight', name: 'Midnight Compass', subtitle: 'Dark · gold accent · focused' },
  { id: 'stone', name: 'Stone & Sage', subtitle: 'Light · olive accent · grounded' },
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
