/*
  # Create Streaming and Multiplayer Tables

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `host_id` (uuid, references users)
      - `game_id` (uuid, references games)
      - `session_name` (text)
      - `is_public` (boolean)
      - `max_players` (integer)
      - `current_players` (integer)
      - `status` (text) - 'waiting', 'playing', 'finished'
      - `created_at` (timestamptz)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)

    - `session_players`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references game_sessions)
      - `user_id` (uuid, references users)
      - `player_number` (integer)
      - `joined_at` (timestamptz)
      - `left_at` (timestamptz)

    - `live_streams`
      - `id` (uuid, primary key)
      - `streamer_id` (uuid, references users)
      - `session_id` (uuid, references game_sessions, nullable)
      - `game_id` (uuid, references games)
      - `title` (text)
      - `description` (text)
      - `thumbnail_url` (text)
      - `viewer_count` (integer)
      - `is_live` (boolean)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `created_at` (timestamptz)

    - `stream_viewers`
      - `id` (uuid, primary key)
      - `stream_id` (uuid, references live_streams)
      - `user_id` (uuid, references users, nullable for anonymous)
      - `joined_at` (timestamptz)
      - `left_at` (timestamptz)

    - `stream_chat`
      - `id` (uuid, primary key)
      - `stream_id` (uuid, references live_streams)
      - `user_id` (uuid, references users)
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to create sessions and streams
    - Add policies for users to view public sessions and streams
    - Add policies for session participants to view session details
    - Add policies for chat participants to send and view messages
*/

-- Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  session_name text NOT NULL,
  is_public boolean DEFAULT true,
  max_players integer DEFAULT 4,
  current_players integer DEFAULT 1,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can view public game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (is_public = true OR host_id = auth.uid());

CREATE POLICY "Host can update their game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can delete their game sessions"
  ON game_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Session Players Table
CREATE TABLE IF NOT EXISTS session_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_number integer NOT NULL,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(session_id, player_number)
);

ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join sessions"
  ON session_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view session players"
  ON session_players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_sessions
      WHERE game_sessions.id = session_id
      AND (game_sessions.is_public = true OR game_sessions.host_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own player record"
  ON session_players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Live Streams Table
CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES game_sessions(id) ON DELETE SET NULL,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  thumbnail_url text,
  viewer_count integer DEFAULT 0,
  is_live boolean DEFAULT true,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create live streams"
  ON live_streams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Users can view live streams"
  ON live_streams FOR SELECT
  TO authenticated
  USING (is_live = true OR streamer_id = auth.uid());

CREATE POLICY "Streamers can update their streams"
  ON live_streams FOR UPDATE
  TO authenticated
  USING (auth.uid() = streamer_id)
  WITH CHECK (auth.uid() = streamer_id);

CREATE POLICY "Streamers can delete their streams"
  ON live_streams FOR DELETE
  TO authenticated
  USING (auth.uid() = streamer_id);

-- Stream Viewers Table
CREATE TABLE IF NOT EXISTS stream_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz
);

ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join as viewers"
  ON stream_viewers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view stream viewers"
  ON stream_viewers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their viewer record"
  ON stream_viewers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Stream Chat Table
CREATE TABLE IF NOT EXISTS stream_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send chat messages"
  ON stream_chat FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view chat messages"
  ON stream_chat FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_streams
      WHERE live_streams.id = stream_id
      AND (live_streams.is_live = true OR live_streams.streamer_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host ON game_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_live_streams_streamer ON live_streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_stream ON stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_created ON stream_chat(created_at);
