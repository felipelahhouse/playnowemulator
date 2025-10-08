/*
  # Initial Database Schema for Retro Gaming Platform

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users id
      - `email` (text, unique) - user email
      - `username` (text, unique) - display name
      - `avatar_url` (text, nullable) - profile picture URL
      - `is_online` (boolean) - current online status
      - `last_seen` (timestamptz) - last activity timestamp
      - `created_at` (timestamptz) - account creation date
    
    - `games`
      - `id` (uuid, primary key)
      - `title` (text) - game name
      - `description` (text) - game description
      - `image_url` (text) - game cover image
      - `rom_url` (text) - path to ROM file
      - `platform` (text) - gaming platform (NES, SNES, Genesis, etc.)
      - `genre` (text) - game genre
      - `year` (integer) - release year
      - `players` (integer) - max number of players
      - `rating` (numeric) - average rating
      - `play_count` (integer) - total times played
      - `created_at` (timestamptz) - when added to database
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references users
      - `username` (text) - cached username for display
      - `message` (text) - message content
      - `created_at` (timestamptz) - message timestamp

  2. Security
    - Enable RLS on all tables
    - Users can read their own profile and other users' basic info
    - Users can update only their own profile
    - Games are publicly readable
    - Only authenticated users can send chat messages
    - Chat messages are publicly readable
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  rom_url text NOT NULL,
  platform text NOT NULL,
  genre text,
  year integer,
  players integer DEFAULT 1,
  rating numeric(2,1) DEFAULT 0.0,
  play_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games are viewable by everyone"
  ON games FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages are viewable by everyone"
  ON chat_messages FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);