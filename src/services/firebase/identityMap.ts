import type { UserIdentity } from '@/types';

/**
 * Fixed two-user allowlist. The application only recognises these two
 * usernames. Each maps to a real Supabase auth email account (created
 * manually in the Supabase dashboard) and to an arcade display identity
 * shown after login.
 *
 * Passwords are NEVER stored here. Authentication is performed by Supabase
 * Auth using signInWithPassword against the mapped email.
 */
const USERNAME_TO_EMAIL: Record<string, string> = {
  herman: 'herman@tvk.app',
  hisgirl: 'hisgirl@tvk.app',
};

const USERNAME_TO_IDENTITY: Record<string, UserIdentity> = {
  herman: 'V',
  hisgirl: 'T',
};

export const ALLOWED_USERNAMES = Object.keys(USERNAME_TO_EMAIL);

export function isAllowedUsername(username: string): boolean {
  return Object.prototype.hasOwnProperty.call(USERNAME_TO_EMAIL, username.toLowerCase());
}

export function emailForUsername(username: string): string {
  const key = username.toLowerCase();
  if (!USERNAME_TO_EMAIL[key]) {
    throw new Error(`Unknown username: ${username}`);
  }
  return USERNAME_TO_EMAIL[key];
}

export function identityForUsername(username: string): UserIdentity {
  const key = username.toLowerCase();
  if (!USERNAME_TO_IDENTITY[key]) {
    throw new Error(`Unknown username: ${username}`);
  }
  return USERNAME_TO_IDENTITY[key];
}

/**
 * Resolve the arcade display identity for an authenticated user by looking
 * up their uid in the allowed_users table. Falls back to username-based
 * mapping only as a last resort; the server is the source of truth.
 */
export async function fetchIdentityForUid(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  uid: string,
): Promise<UserIdentity | null> {
  const { data, error } = await supabase
    .from('allowed_users')
    .select('display_identity')
    .eq('uid', uid)
    .maybeSingle();

  if (error || !data) return null;
  return data.display_identity as UserIdentity;
}
