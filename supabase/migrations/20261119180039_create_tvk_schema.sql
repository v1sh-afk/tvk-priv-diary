/*
# TVK — shared diary + sticky notes for two authorised users

## Overview
Creates the core data model for TVK, a private two-user digital diary.
Both users (identities V and T) share all diary entries and sticky notes.
Access is restricted to exactly two authorised Supabase auth UIDs via an
allowlist check in every RLS policy. The two accounts must be created
manually in the Supabase auth dashboard; their UIDs live in `allowed_users`
as the single source of truth, and policies reference that table.

## 1. New Tables
- `allowed_users` (uid PK, username unique, display_identity, created_at)
- `diary_entries` (id, title, content, entry_date, author_uid, author_identity, created_at, updated_at)
- `sticky_notes` (id, content, color, author_uid, author_identity, created_at, updated_at)

## 2. Immutability
Triggers prevent changing author_uid / author_identity / entry_date on update.

## 3. Security — RLS + Grants
- allowed_users: SELECT to authenticated only.
- diary_entries + sticky_notes: CRUD to authenticated only, gated by allowlist membership.
- INSERT requires author_uid = auth.uid() and valid identity.

## 4. Indexes
- diary_entries(entry_date), diary_entries(created_at desc), sticky_notes(updated_at desc).

## 5. Notes
- UIDs for the two real accounts are inserted into allowed_users out of band.
*/

CREATE TABLE IF NOT EXISTS allowed_users (
  uid uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_identity text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON allowed_users TO authenticated;

DROP POLICY IF EXISTS "allowed_users_read_for_authenticated" ON allowed_users;
CREATE POLICY "allowed_users_read_for_authenticated"
  ON allowed_users FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users au WHERE au.uid = auth.uid()));

CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  entry_date date NOT NULL,
  author_uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_identity text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON diary_entries TO authenticated;

DROP POLICY IF EXISTS "diary_select_approved" ON diary_entries;
CREATE POLICY "diary_select_approved"
  ON diary_entries FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid()));

DROP POLICY IF EXISTS "diary_insert_approved" ON diary_entries;
CREATE POLICY "diary_insert_approved"
  ON diary_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid())
    AND author_uid = auth.uid()
    AND author_identity IN ('V','T')
  );

DROP POLICY IF EXISTS "diary_update_approved" ON diary_entries;
CREATE POLICY "diary_update_approved"
  ON diary_entries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid()))
  WITH CHECK (
    EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid())
    AND author_identity IN ('V','T')
  );

DROP POLICY IF EXISTS "diary_delete_approved" ON diary_entries;
CREATE POLICY "diary_delete_approved"
  ON diary_entries FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid()));

CREATE TABLE IF NOT EXISTS sticky_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'pink',
  author_uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_identity text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON sticky_notes TO authenticated;

DROP POLICY IF EXISTS "sticky_select_approved" ON sticky_notes;
CREATE POLICY "sticky_select_approved"
  ON sticky_notes FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid()));

DROP POLICY IF EXISTS "sticky_insert_approved" ON sticky_notes;
CREATE POLICY "sticky_insert_approved"
  ON sticky_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid())
    AND author_uid = auth.uid()
    AND author_identity IN ('V','T')
  );

DROP POLICY IF EXISTS "sticky_update_approved" ON sticky_notes;
CREATE POLICY "sticky_update_approved"
  ON sticky_notes FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid()))
  WITH CHECK (
    EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid())
    AND author_identity IN ('V','T')
  );

DROP POLICY IF EXISTS "sticky_delete_approved" ON sticky_notes;
CREATE POLICY "sticky_delete_approved"
  ON sticky_notes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM allowed_users WHERE uid = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_diary_entry_date ON diary_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_diary_created_at ON diary_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sticky_updated_at ON sticky_notes(updated_at DESC);

CREATE OR REPLACE FUNCTION protect_diary_author()
RETURNS trigger
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS trg_protect_diary_author ON diary_entries;
CREATE TRIGGER trg_protect_diary_author
  BEFORE UPDATE ON diary_entries
  FOR EACH ROW EXECUTE FUNCTION protect_diary_author();

CREATE OR REPLACE FUNCTION protect_sticky_author()
RETURNS trigger
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS trg_protect_sticky_author ON sticky_notes;
CREATE TRIGGER trg_protect_sticky_author
  BEFORE UPDATE ON sticky_notes
  FOR EACH ROW EXECUTE FUNCTION protect_sticky_author();
