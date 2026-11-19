import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimeOfDay } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

type ThemeConfig = {
  sky: string;
  horizon: string;
  accent: string;
};

const THEMES: Record<TimeOfDay, ThemeConfig> = {
  morning: {
    sky: 'linear-gradient(180deg, #a8d8f0 0%, #cfe8f5 35%, #f9e2c4 70%, #f7d4b0 100%)',
    horizon: '#f9e2c4',
    accent: '#ffd8a8',
  },
  afternoon: {
    sky: 'linear-gradient(180deg, #4ba3e0 0%, #7cc6ee 30%, #aee0ff 60%, #d9f1ff 100%)',
    horizon: '#d9f1ff',
    accent: '#5fe9ff',
  },
  evening: {
    sky: 'linear-gradient(180deg, #2a1f4e 0%, #6b3a6b 25%, #c45a7a 50%, #ff9971 75%, #ffd29b 100%)',
    horizon: '#ffd29b',
    accent: '#ff7a8a',
  },
  night: {
    sky: 'linear-gradient(180deg, #05070f 0%, #0a0e27 40%, #0f1f4e 80%, #1a2a5e 100%)',
    horizon: '#1a2a5e',
    accent: '#5fe9ff',
  },
};

function Particles({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const items = useMemo(() => {
    const count = timeOfDay === 'night' ? 50 : 18;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 18 + Math.random() * 22,
      size: 2 + Math.random() * 3,
    }));
  }, [timeOfDay]);

  const color =
    timeOfDay === 'night'
      ? '#c7b8ff'
      : timeOfDay === 'evening'
        ? '#ffd29b'
        : 'rgba(255,255,255,0.7)';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 55,
        delay: Math.random() * 3,
        size: Math.random() < 0.2 ? 3 : 2,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s) => (
        <span
          key={s.id}
          className="twinkle absolute"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: '#fff',
            imageRendering: 'pixelated',
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* moon */}
      <div
        className="absolute right-[12%] top-[12%] rounded-full"
        style={{
          width: '54px',
          height: '54px',
          background: '#f4f0ff',
          boxShadow: '0 0 30px rgba(199,184,255,0.6), inset -8px -6px 0 rgba(10,14,39,0.25)',
        }}
      />
    </div>
  );
}

function Sun({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const config: Record<'morning' | 'afternoon' | 'evening', { color: string; glow: string; top: string }> = {
    morning: { color: '#fff3d6', glow: 'rgba(255, 220, 170, 0.7)', top: '40%' },
    afternoon: { color: '#fff7e0', glow: 'rgba(255, 240, 180, 0.6)', top: '15%' },
    evening: { color: '#ffb27a', glow: 'rgba(255, 140, 90, 0.8)', top: '60%' },
  };
  if (timeOfDay === 'night') return null;
  const c = config[timeOfDay];
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        right: '15%',
        top: c.top,
        width: '70px',
        height: '70px',
        background: c.color,
        boxShadow: `0 0 60px ${c.glow}, 0 0 120px ${c.glow}`,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.2 }}
    />
  );
}

function Clouds() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: 12 + i * 14,
        delay: i * 8,
        duration: 70 + i * 18,
        scale: 0.7 + Math.random() * 0.6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c) => (
        <div
          key={c.id}
          className="drift absolute"
          style={{ top: `${c.top}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s` }}
        >
          <div
            className="relative"
            style={{ transform: `scale(${c.scale})`, imageRendering: 'pixelated' }}
          >
            <div className="flex items-end gap-1">
              <div className="w-10 h-8 bg-white/70 rounded-sm" />
              <div className="w-16 h-12 bg-white/80 rounded-sm" />
              <div className="w-10 h-7 bg-white/70 rounded-sm" />
            </div>
            <div className="w-24 h-3 bg-white/60 -mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EnvironmentBackground() {
  const { effective } = useTheme();
  const theme = THEMES[effective];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden theme-transition">
      <AnimatePresence mode="wait">
        <motion.div
          key={effective}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
          style={{ background: theme.sky }}
        />
      </AnimatePresence>

      {/* horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.horizon}55 60%, ${theme.accent}22 100%)`,
        }}
      />

      {/* pixel ground line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{ background: theme.accent, opacity: 0.4, imageRendering: 'pixelated' }}
      />

      {effective === 'night' && <Stars />}
      {effective !== 'night' && <Clouds />}
      <Sun timeOfDay={effective} />
      <Particles timeOfDay={effective} />
    </div>
  );
}
