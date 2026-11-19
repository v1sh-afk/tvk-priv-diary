import { motion } from 'framer-motion';
import { Home, BookHeart, Pin, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppView } from '@/types';
import { formatDateLong, TIME_OF_DAY_LABEL } from '@/utils/time';

type Props = {
  view: AppView;
  onNavigate: (v: AppView) => void;
  children: React.ReactNode;
};

const NAV_ITEMS: { id: AppView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'memories', label: 'MEMORIES', icon: BookHeart },
  { id: 'pinboard', label: 'PINBOARD', icon: Pin },
  { id: 'settings', label: 'SETTINGS', icon: Settings },
];

export default function DashboardLayout({ view, onNavigate, children }: Props) {
  const { identity, signOut } = useAuth();
  const { effective } = useTheme();

  return (
    <div className="min-h-screen crt-scanlines">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-30 backdrop-blur-md bg-navy-deep/50 border-b border-cyan-glow/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 shrink-0 grid place-items-center bg-cyan-glow/10 border border-cyan-glow/40">
              <span className="font-arcade text-[0.5rem] text-cyan-glow">TVK</span>
            </div>
            <div className="min-w-0">
              <p className="font-arcade text-[0.6rem] sm:text-[0.7rem] text-cyan-glow rgb-text truncate">
                WELCOME, {identity}
              </p>
              <p className="text-[0.65rem] text-muted truncate hidden sm:block">
                {formatDateLong(new Date())} · {TIME_OF_DAY_LABEL[effective]}
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 font-arcade text-[0.5rem] tracking-wider transition-all ${
                    active
                      ? 'text-cyan-glow'
                      : 'text-muted hover:text-ink'
                  }`}
                  aria-label={item.label}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 border border-cyan-glow/40 bg-cyan-glow/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    />
                  )}
                </button>
              );
            })}

            <button
              onClick={() => signOut()}
              className="ml-1 flex items-center gap-1.5 px-2 sm:px-3 py-2 font-arcade text-[0.5rem] tracking-wider text-coral hover:text-coral/80 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">EXIT</span>
            </button>
          </nav>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
