/*
  # Align game_sessions host columns with new frontend expectations

  - Ensures the canonical column is host_user_id
  - Reintroduces a generated host_id alias for legacy clients still requesting it
  - Refreshes RLS policies and indexes to use host_user_id
*/

DO $$
BEGIN
  -- If the legacy column host_id still exists as a physical column, rename it
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'game_sessions'
      AND column_name = 'host_id'
      AND is_generated = 'NEVER'
  ) THEN
    RAISE NOTICE 'Renaming legacy host_id column to host_user_id';
    ALTER TABLE game_sessions RENAME COLUMN host_id TO host_user_id;
  END IF;
END $$;

DO $$
BEGIN
  -- Guarantee the canonical host_user_id column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'game_sessions'
      AND column_name = 'host_user_id'
  ) THEN
    RAISE EXCEPTION 'Column host_user_id is required on game_sessions. Please ensure the previous migrations ran correctly.';
  END IF;
END $$;

DO $$
BEGIN
  -- Add generated compatibility column host_id if missing
  ALTER TABLE game_sessions
    ADD COLUMN host_id uuid GENERATED ALWAYS AS (host_user_id) STORED;
EXCEPTION
  WHEN duplicate_column THEN
    NULL;
END $$;

-- Refresh foreign keys to ensure both columns are backed by auth.users
ALTER TABLE game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_host_user_id_fkey;

ALTER TABLE game_sessions
  ADD CONSTRAINT game_sessions_host_user_id_fkey
  FOREIGN KEY (host_user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_host_id_fkey;

ALTER TABLE game_sessions
  ADD CONSTRAINT game_sessions_host_id_fkey
  FOREIGN KEY (host_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Ensure indexes are aligned with the new canonical column
DROP INDEX IF EXISTS idx_game_sessions_host;
CREATE INDEX IF NOT EXISTS idx_game_sessions_host_user ON game_sessions(host_user_id);

-- Recreate RLS policies with the new column names
DROP POLICY IF EXISTS "Users can create game sessions" ON game_sessions;
CREATE POLICY "Users can create game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

DROP POLICY IF EXISTS "Users can view public game sessions" ON game_sessions;
CREATE POLICY "Users can view public game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (is_public = true OR host_user_id = auth.uid());

DROP POLICY IF EXISTS "Host can update their game sessions" ON game_sessions;
CREATE POLICY "Host can update their game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id)
  WITH CHECK (auth.uid() = host_user_id);

DROP POLICY IF EXISTS "Host can delete their game sessions" ON game_sessions;
CREATE POLICY "Host can delete their game sessions"
  ON game_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = host_user_id);
