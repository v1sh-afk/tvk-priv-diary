import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TimeOfDay } from '@/types';
import { getTimeOfDay } from '@/utils/time';

type ThemeContextValue = {
  timeOfDay: TimeOfDay;
  preview: TimeOfDay | null;
  setPreview: (t: TimeOfDay | null) => void;
  effective: TimeOfDay;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const PREVIEW_KEY = 'tvk_theme_preview';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());
  const [preview, setPreviewState] = useState<TimeOfDay | null>(() => {
    const saved = localStorage.getItem(PREVIEW_KEY);
    return saved ? (saved as TimeOfDay) : null;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const setPreview = (t: TimeOfDay | null) => {
    setPreviewState(t);
    if (t) localStorage.setItem(PREVIEW_KEY, t);
    else localStorage.removeItem(PREVIEW_KEY);
  };

  const effective = preview ?? timeOfDay;

  return (
    <ThemeContext.Provider value={{ timeOfDay, preview, setPreview, effective }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
