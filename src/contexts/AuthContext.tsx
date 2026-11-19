import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/firebase/supabaseClient';
import { fetchIdentityForUid, emailForUsername, isAllowedUsername } from '@/services/firebase/identityMap';
import type { UserIdentity } from '@/types';

type AuthContextValue = {
  session: Session | null;
  identity: UserIdentity | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        fetchIdentityForUid(supabase, data.session.user.id).then((id) => {
          if (mounted) {
            setIdentity(id);
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
        if (newSession) {
          const id = await fetchIdentityForUid(supabase, newSession.user.id);
          setIdentity(id);
        } else {
          setIdentity(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    if (!isAllowedUsername(username)) {
      throw new Error('Invalid credentials');
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: emailForUsername(username),
      password,
    });
    if (error) throw new Error('Invalid credentials');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIdentity(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, identity, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
