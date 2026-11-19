/*
# TVK Security Hardening — revoke anon grants, fix function search_path

## Overview
The initial migration created tables with RLS enabled and policies scoped to
`authenticated` only. However, Postgres grants table privileges to `PUBLIC`
by default in some configurations, and the security posture audit revealed
that the `anon` role retained SELECT/INSERT/UPDATE/DELETE grants on all three
tables (allowed_users, diary_entries, sticky_notes). While RLS policies block
anon access (no anon policy exists = no rows returned), the grants themselves
are overly broad and violate least-privilege.

## Changes
1. REVOKE all privileges from `anon` on all three tables. The anon role has
   no policies, so it must have no grants either.
2. REVOKE all privileges from `PUBLIC` on all three tables (defensive —
   PUBLIC includes anon).
3. Re-grant SELECT to `authenticated` on `allowed_users` (read-only identity
   lookup).
4. Re-grant SELECT, INSERT, UPDATE, DELETE to `authenticated` on
   `diary_entries` and `sticky_notes`.
5. Fix `protect_diary_author` and `protect_sticky_author` functions: add
   `SET search_path = public` to eliminate the mutable search_path security
   warning flagged by Supabase advisor.
6. Fix `bump_diary_updated_at` function search_path as well.

## Security impact
- anon role: NO grants on any table. Unauthenticated requests get 42501.
- authenticated role: grants only on tables with authenticated-scoped policies.
- Function search_path is pinned to public, preventing search_path injection.
*/

-- Revoke anon + PUBLIC privileges on all tables
REVOKE ALL ON allowed_users FROM anon, PUBLIC;
REVOKE ALL ON diary_entries FROM anon, PUBLIC;
REVOKE ALL ON sticky_notes FROM anon, PUBLIC;

-- Re-grant authenticated privileges (allowed_users: SELECT only)
GRANT SELECT ON allowed_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON diary_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sticky_notes TO authenticated;

-- Fix mutable search_path on trigger functions
CREATE OR REPLACE FUNCTION protect_diary_author()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.author_uid IS DISTINCT FROM OLD.author_uid THEN
    RAISE EXCEPTION 'author_uid is immutable';
  END IF;
  IF NEW.author_identity IS DISTINCT FROM OLD.author_identity THEN
    RAISE EXCEPTION 'author_identity is immutable';
  END IF;
  IF NEW.entry_date IS DISTINCT FROM OLD.entry_date THEN
    RAISE EXCEPTION 'entry_date is immutable';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_sticky_author()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.author_uid IS DISTINCT FROM OLD.author_uid THEN
    RAISE EXCEPTION 'author_uid is immutable';
  END IF;
  IF NEW.author_identity IS DISTINCT FROM OLD.author_identity THEN
    RAISE EXCEPTION 'author_identity is immutable';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION bump_diary_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
