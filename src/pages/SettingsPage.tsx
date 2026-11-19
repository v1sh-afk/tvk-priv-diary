import { motion } from 'framer-motion';
import { Sun, Moon, Sunset, Coffee, Eye, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { TimeOfDay } from '@/types';
import { TIME_OF_DAY_LABEL } from '@/utils/time';

const THEME_CARDS: { id: TimeOfDay; icon: typeof Sun; desc: string }[] = [
  { id: 'morning', icon: Coffee, desc: 'Pastel skies and warm sunrise light' },
  { id: 'afternoon', icon: Sun, desc: 'Bright cyan daylight and clear clouds' },
  { id: 'evening', icon: Sunset, desc: 'Peach, lavender and sunset gradients' },
  { id: 'night', icon: Moon, desc: 'Deep navy, pixel stars and moon glow' },
];

export default function SettingsPage() {
  const { identity, signOut } = useAuth();
  const { timeOfDay, preview, setPreview } = useTheme();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-5">
        <h2 className="font-arcade text-[0.75rem] text-ink mb-4">ACCOUNT</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 grid place-items-center bg-cyan-glow/10 border border-cyan-glow/40">
            <span className="font-arcade text-sm text-cyan-glow">{identity}</span>
          </div>
          <div>
            <p className="text-sm text-ink">
              Signed in as <span className="text-cyan-glow font-arcade text-[0.7rem]">{identity}</span>
            </p>
            <p className="text-[0.65rem] text-muted mt-0.5">One of two authorised travellers.</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="font-arcade text-[0.55rem] px-4 py-2.5 border border-coral/50 text-coral hover:bg-coral/10 transition-colors"
        >
          SIGN OUT
        </button>
      </div>

      <div className="bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-5">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h2 className="font-arcade text-[0.75rem] text-ink">ENVIRONMENT</h2>
          {preview && (
            <button
              onClick={() => setPreview(null)}
              className="flex items-center gap-1 font-arcade text-[0.5rem] text-coral hover:text-coral/80"
            >
              <RotateCcw size={11} /> LIVE
            </button>
          )}
        </div>
        <p className="text-[0.7rem] text-muted mb-4">
          The world follows your local clock: currently{' '}
          <span className="text-cyan-glow font-arcade text-[0.55rem]">{TIME_OF_DAY_LABEL[timeOfDay]}</span>.
          Preview any theme below — previewing does not override the live environment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {THEME_CARDS.map((card) => {
            const Icon = card.icon;
            const isPreviewing = preview === card.id;
            const isLive = !preview && timeOfDay === card.id;
            return (
              <motion.button
                key={card.id}
                whileHover={{ y: -2 }}
                onClick={() => setPreview(isPreviewing ? null : card.id)}
                className={`relative text-left p-4 border transition-all ${
                  isPreviewing
                    ? 'border-cyan-glow bg-cyan-glow/10'
                    : isLive
                      ? 'border-turquoise/50 bg-turquoise/5'
                      : 'border-cyan-glow/20 bg-navy-deep/40 hover:border-cyan-glow/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-cyan-glow" />
                  <span className="font-arcade text-[0.6rem] text-ink">
                    {TIME_OF_DAY_LABEL[card.id]}
                  </span>
                  {isLive && (
                    <span className="ml-auto font-arcade text-[0.45rem] text-turquoise">LIVE</span>
                  )}
                  {isPreviewing && (
                    <span className="ml-auto flex items-center gap-1 font-arcade text-[0.45rem] text-cyan-glow">
                      <Eye size={10} /> PREVIEW
                    </span>
                  )}
                </div>
                <p className="text-[0.7rem] text-muted leading-relaxed">{card.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-5">
        <h2 className="font-arcade text-[0.75rem] text-ink mb-3">ABOUT TVK</h2>
        <p className="text-sm text-muted leading-relaxed">
          A private arcade world for two. Memories, a shared calendar, and a pinboard —
          synced in real time between V and T. No one else has a key.
        </p>
      </div>
    </div>
  );
}
