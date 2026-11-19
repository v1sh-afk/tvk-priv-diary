import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import MemoriesPage from '@/pages/MemoriesPage';
import PinboardPage from '@/pages/PinboardPage';
import SettingsPage from '@/pages/SettingsPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EnvironmentBackground from '@/components/layout/EnvironmentBackground';
import ArcadeTransition from '@/components/layout/ArcadeTransition';
import type { AppView } from '@/types';

function Shell() {
  const { session, identity, loading } = useAuth();
  const [view, setView] = useState<AppView>('home');
  const [transitioning, setTransitioning] = useState(false);
  const greetedRef = useRef(false);

  // Show arcade transition once after first login
  useEffect(() => {
    if (session && identity && !greetedRef.current) {
      greetedRef.current = true;
      setTransitioning(true);
      const t = setTimeout(() => {
        setTransitioning(false);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [session, identity]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-navy-deep">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 bg-cyan-glow"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!session || !identity) {
    return <LoginPage />;
  }

  if (transitioning) {
    return <ArcadeTransition identity={identity} />;
  }

  return (
    <>
      <EnvironmentBackground />
      <DashboardLayout view={view} onNavigate={setView}>
        {view === 'home' && <HomePage />}
        {view === 'memories' && <MemoriesPage />}
        {view === 'pinboard' && <PinboardPage />}
        {view === 'settings' && <SettingsPage />}
      </DashboardLayout>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ThemeProvider>
  );
}
