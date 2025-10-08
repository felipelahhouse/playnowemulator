export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  is_online: boolean;
  last_seen: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  image_url: string;
  rom_url: string;
  platform: string;
  genre: string;
  year: number;
  players: number;
  rating: number;
  play_count: number;
}

export interface GameSession {
  id: string;
  game_id: string;
  host_id: string;
  players: string[];
  max_players: number;
  is_private: boolean;
  created_at: string;
  status: 'waiting' | 'playing' | 'finished';
}

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  room: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at?: string;
}