import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Enter your credentials.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center px-4 crt-scanlines">
      {/* faint monochrome grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-neutral-900/80 border border-neutral-700 px-8 py-10 backdrop-blur-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            {/* anonymous pixel cursor glyph */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="h-3 w-3 bg-neutral-300"
              style={{ imageRendering: 'pixelated' }}
            />
            <p className="font-arcade text-[0.6rem] text-neutral-500 tracking-widest">
              ACCESS TERMINAL
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-arcade text-[0.5rem] text-neutral-500 tracking-wider">
                USERNAME
              </span>
              <div className="relative">
                <UserIcon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 text-sm pl-9 pr-3 py-3 outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-600"
                  placeholder=" "
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-arcade text-[0.5rem] text-neutral-500 tracking-wider">
                PASSWORD
              </span>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 text-sm pl-9 pr-10 py-3 outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-600"
                  placeholder=" "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-arcade text-[0.5rem] text-neutral-400 tracking-wider"
              >
                ✕ {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-arcade text-[0.6rem] tracking-widest border border-neutral-600 bg-neutral-900 text-neutral-300 py-3 hover:bg-neutral-800 hover:border-neutral-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'VERIFYING…' : 'ENTER'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[0.6rem] text-neutral-700 font-arcade tracking-widest">
          AUTHORIZED PERSONNEL ONLY
        </p>
      </motion.div>
    </div>
  );
}
