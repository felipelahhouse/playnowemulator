-- ==========================================
-- SQL CORRIGIDO - COPIE TUDO DAQUI
-- ==========================================

-- PASSO 1: Remover tudo que pode dar conflito
DROP TRIGGER IF EXISTS trigger_create_user_stats ON users;
DROP FUNCTION IF EXISTS create_user_stats() CASCADE;
DROP FUNCTION IF EXISTS unlock_achievement(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS add_user_xp(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS calculate_level(INTEGER) CASCADE;

-- PASSO 2: Remover todas as policies antigas
DO $$ 
BEGIN
    -- user_stats
    DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
    
    -- user_favorites
    DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
    
    -- play_history
    DROP POLICY IF EXISTS "Users can manage own history" ON play_history;
    
    -- achievements
    DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
    
    -- user_achievements
    DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
    DROP POLICY IF EXISTS "Users can unlock achievements" ON user_achievements;
    
    -- friendships
    DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
    DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
    DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;
    DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
    
    -- notifications
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can create notifications" ON notifications;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- PASSO 3: Criar tabelas (se não existirem)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_playtime INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  multiplayer_sessions INTEGER DEFAULT 0,
  streams_created INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  playtime INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_played INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  rarity VARCHAR(20) DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 4: Criar índices
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_game_id ON user_favorites(game_id);
CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_last_played ON play_history(last_played DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- PASSO 5: Ativar RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Criar policies novas
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own history"
  ON play_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- PASSO 7: Inserir conquistas
INSERT INTO achievements (key, title, description, icon, xp_reward, rarity) VALUES
  ('first_login', 'Bem-vindo!', 'Faça seu primeiro login no PlayNowEmu', '👋', 50, 'common'),
  ('first_game', 'Gamer Iniciante', 'Jogue seu primeiro jogo', '🎮', 100, 'common'),
  ('profile_photo', 'Estiloso', 'Adicione uma foto de perfil', '📸', 75, 'common'),
  ('games_5', 'Explorador', 'Jogue 5 jogos diferentes', '🗺️', 200, 'common'),
  ('games_10', 'Colecionador', 'Jogue 10 jogos diferentes', '📚', 300, 'rare'),
  ('games_25', 'Veterano', 'Jogue 25 jogos diferentes', '🏆', 500, 'epic'),
  ('playtime_1h', 'Dedicado', 'Jogue por 1 hora', '⏰', 150, 'common'),
  ('playtime_10h', 'Hardcore Gamer', 'Jogue por 10 horas', '🔥', 400, 'rare'),
  ('playtime_50h', 'Lenda', 'Jogue por 50 horas', '👑', 1000, 'legendary'),
  ('first_room', 'Host Iniciante', 'Crie sua primeira sala multiplayer', '🚪', 150, 'common'),
  ('multiplayer_5', 'Jogador Social', 'Participe de 5 sessões multiplayer', '👥', 250, 'rare'),
  ('multiplayer_20', 'Mestre do Multiplayer', 'Participe de 20 sessões multiplayer', '🎯', 500, 'epic'),
  ('first_stream', 'Streamer Novato', 'Faça sua primeira live', '📺', 200, 'common'),
  ('streams_5', 'Streamer Regular', 'Faça 5 lives', '🎥', 350, 'rare'),
  ('viewers_10', 'Estrela Nascente', 'Tenha 10 espectadores simultâneos', '⭐', 500, 'epic'),
  ('first_friend', 'Fazendo Amigos', 'Adicione seu primeiro amigo', '👋', 100, 'common'),
  ('friends_5', 'Popular', 'Tenha 5 amigos', '🌟', 200, 'rare'),
  ('friends_20', 'Influencer', 'Tenha 20 amigos', '💫', 500, 'epic'),
  ('night_owl', 'Coruja Noturna', 'Jogue entre 2h e 5h da manhã', '🦉', 300, 'rare'),
  ('early_bird', 'Madrugador', 'Jogue antes das 6h da manhã', '🌅', 300, 'rare'),
  ('halloween_2024', 'Espírito Halloween', 'Jogue durante Outubro de 2024', '🎃', 250, 'epic'),
  ('speed_runner', 'Velocista', 'Complete um jogo em menos de 1 hora', '⚡', 400, 'rare'),
  ('completionist', 'Completista', 'Desbloqueie 10 conquistas', '💯', 500, 'epic'),
  ('legendary_player', 'Jogador Lendário', 'Atinja nível 50', '👑', 2000, 'legendary')
ON CONFLICT (key) DO NOTHING;

-- PASSO 8: Criar funções
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS void AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
BEGIN
  SELECT experience, level INTO v_new_xp, v_old_level
  FROM user_stats
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, experience, level)
    VALUES (p_user_id, p_xp_amount, calculate_level(p_xp_amount));
    RETURN;
  END IF;
  
  v_new_xp := v_new_xp + p_xp_amount;
  v_new_level := calculate_level(v_new_xp);
  
  UPDATE user_stats
  SET 
    experience = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  IF v_new_level > v_old_level THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      p_user_id,
      'level_up',
      'Você subiu de nível! 🎉',
      format('Parabéns! Você alcançou o nível %s', v_new_level),
      jsonb_build_object('level', v_new_level, 'xp', v_new_xp)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION unlock_achievement(p_user_id UUID, p_achievement_key VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_xp_reward INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  SELECT id, xp_reward INTO v_achievement_id, v_xp_reward
  FROM achievements
  WHERE key = p_achievement_key;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = v_achievement_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id);
  
  PERFORM add_user_xp(p_user_id, v_xp_reward);
  
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    p_user_id,
    'achievement',
    format('Conquista Desbloqueada! %s', icon),
    format('%s - +%s XP', title, xp_reward),
    jsonb_build_object(
      'achievement_id', id,
      'key', key,
      'xp_reward', xp_reward
    )
  FROM achievements
  WHERE id = v_achievement_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- PASSO 9: Criar trigger
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  PERFORM unlock_achievement(NEW.id, 'first_login');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_stats
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();

-- FIM - Tudo pronto! ✅
