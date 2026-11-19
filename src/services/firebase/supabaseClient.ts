import { createClient } from '@supabase/supabase-js';

type EnvRecord = Record<string, string | undefined>;

const env = import.meta.env as EnvRecord;

// Bolt provides Supabase credentials under SUPABASE_* names. Vite only
// exposes VITE_*-prefixed vars to the browser, so accept either convention.
const supabaseUrl =
  env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? undefined;
const supabaseAnonKey =
  env.VITE_SUPABASE_ANON_KEY ?? env.SUPABASE_ANON_KEY ?? undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'TVK: Supabase environment variables are missing. ' +
      'Expected VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (or SUPABASE_URL / SUPABASE_ANON_KEY). ' +
      'Add them to your .env file and restart.',
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
