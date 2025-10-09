-- ==========================================
-- NOVAS FEATURES PARA USUÁRIOS (V2 - Safe)
-- Sistema de XP, Conquistas, Favoritos, etc
-- ==========================================

-- Tabela de Estatísticas do Usuário
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_playtime INTEGER DEFAULT 0, -- em minutos
  games_played INTEGER DEFAULT 0,
  multiplayer_sessions INTEGER DEFAULT 0,
  streams_created INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de Jogos Favoritos
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Tabela de Histórico de Jogos
CREATE TABLE IF NOT EXISTS play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  playtime INTEGER DEFAULT 0, -- em minutos
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_played INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Tabela de Conquistas (Achievements)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL, -- emoji
  xp_reward INTEGER DEFAULT 100,
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conquistas Desbloqueadas pelos Usuários
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de Amizades
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- achievement, friend_request, multiplayer_invite, etc
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- dados extras
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================

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

-- ==========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- REMOVER POLICIES EXISTENTES ANTES DE RECRIAR
-- ==========================================

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes (se existirem)
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage own history" ON play_history;
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can unlock achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- User Stats: usuários podem ver e atualizar suas próprias stats
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

-- Favoritos: usuários gerenciam seus próprios favoritos
CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Histórico: usuários veem e gerenciam seu próprio histórico
CREATE POLICY "Users can manage own history"
  ON play_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements: todos podem ver
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

-- User Achievements: usuários veem suas próprias conquistas
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Friendships: usuários gerenciam suas próprias amizades
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

-- Notifications: usuários veem e gerenciam suas próprias notificações
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

-- ==========================================
-- CONQUISTAS INICIAIS (ACHIEVEMENTS)
-- ==========================================

INSERT INTO achievements (key, title, description, icon, xp_reward, rarity) VALUES
  -- Primeiros Passos
  ('first_login', 'Bem-vindo!', 'Faça seu primeiro login no PlayNowEmu', '👋', 50, 'common'),
  ('first_game', 'Gamer Iniciante', 'Jogue seu primeiro jogo', '🎮', 100, 'common'),
  ('profile_photo', 'Estiloso', 'Adicione uma foto de perfil', '📸', 75, 'common'),
  
  -- Jogos
  ('games_5', 'Explorador', 'Jogue 5 jogos diferentes', '🗺️', 200, 'common'),
  ('games_10', 'Colecionador', 'Jogue 10 jogos diferentes', '📚', 300, 'rare'),
  ('games_25', 'Veterano', 'Jogue 25 jogos diferentes', '🏆', 500, 'epic'),
  ('playtime_1h', 'Dedicado', 'Jogue por 1 hora', '⏰', 150, 'common'),
  ('playtime_10h', 'Hardcore Gamer', 'Jogue por 10 horas', '🔥', 400, 'rare'),
  ('playtime_50h', 'Lenda', 'Jogue por 50 horas', '👑', 1000, 'legendary'),
  
  -- Multiplayer
  ('first_room', 'Host Iniciante', 'Crie sua primeira sala multiplayer', '🚪', 150, 'common'),
  ('multiplayer_5', 'Jogador Social', 'Participe de 5 sessões multiplayer', '👥', 250, 'rare'),
  ('multiplayer_20', 'Mestre do Multiplayer', 'Participe de 20 sessões multiplayer', '🎯', 500, 'epic'),
  
  -- Streaming
  ('first_stream', 'Streamer Novato', 'Faça sua primeira live', '📺', 200, 'common'),
  ('streams_5', 'Streamer Regular', 'Faça 5 lives', '🎥', 350, 'rare'),
  ('viewers_10', 'Estrela Nascente', 'Tenha 10 espectadores simultâneos', '⭐', 500, 'epic'),
  
  -- Social
  ('first_friend', 'Fazendo Amigos', 'Adicione seu primeiro amigo', '👋', 100, 'common'),
  ('friends_5', 'Popular', 'Tenha 5 amigos', '🌟', 200, 'rare'),
  ('friends_20', 'Influencer', 'Tenha 20 amigos', '💫', 500, 'epic'),
  
  -- Especiais
  ('night_owl', 'Coruja Noturna', 'Jogue entre 2h e 5h da manhã', '🦉', 300, 'rare'),
  ('early_bird', 'Madrugador', 'Jogue antes das 6h da manhã', '🌅', 300, 'rare'),
  ('halloween_2024', 'Espírito Halloween', 'Jogue durante Outubro de 2024', '🎃', 250, 'epic'),
  ('speed_runner', 'Velocista', 'Complete um jogo em menos de 1 hora', '⚡', 400, 'rare'),
  ('completionist', 'Completista', 'Desbloqueie 10 conquistas', '💯', 500, 'epic'),
  ('legendary_player', 'Jogador Lendário', 'Atinja nível 50', '👑', 2000, 'legendary')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- FUNÇÕES AUXILIARES
-- ==========================================

-- Função para calcular nível baseado em XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Fórmula: Level = sqrt(XP / 100)
  -- Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP, Level 4 = 900 XP, etc
  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para adicionar XP e atualizar nível
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS void AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
BEGIN
  -- Busca stats atuais
  SELECT experience, level INTO v_new_xp, v_old_level
  FROM user_stats
  WHERE user_id = p_user_id;
  
  -- Se não existir, cria
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, experience, level)
    VALUES (p_user_id, p_xp_amount, calculate_level(p_xp_amount));
    RETURN;
  END IF;
  
  -- Adiciona XP
  v_new_xp := v_new_xp + p_xp_amount;
  v_new_level := calculate_level(v_new_xp);
  
  -- Atualiza stats
  UPDATE user_stats
  SET 
    experience = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Se subiu de nível, criar notificação
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

-- Função para desbloquear conquista
CREATE OR REPLACE FUNCTION unlock_achievement(p_user_id UUID, p_achievement_key VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_xp_reward INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Busca conquista
  SELECT id, xp_reward INTO v_achievement_id, v_xp_reward
  FROM achievements
  WHERE key = p_achievement_key;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica se já foi desbloqueada
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = v_achievement_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    RETURN FALSE;
  END IF;
  
  -- Desbloqueia conquista
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id);
  
  -- Adiciona XP
  PERFORM add_user_xp(p_user_id, v_xp_reward);
  
  -- Cria notificação
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

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_create_user_stats ON users;

-- Trigger para criar stats quando usuário é criado
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Desbloqueia conquista de primeiro login
  PERFORM unlock_achievement(NEW.id, 'first_login');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_stats
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();

-- ==========================================
-- COMENTÁRIOS
-- ==========================================

COMMENT ON TABLE user_stats IS 'Estatísticas gerais do usuário (XP, level, tempo jogado, etc)';
COMMENT ON TABLE user_favorites IS 'Jogos favoritos do usuário';
COMMENT ON TABLE play_history IS 'Histórico de jogos jogados pelo usuário';
COMMENT ON TABLE achievements IS 'Lista de conquistas disponíveis no sistema';
COMMENT ON TABLE user_achievements IS 'Conquistas desbloqueadas por cada usuário';
COMMENT ON TABLE friendships IS 'Sistema de amizades entre usuários';
COMMENT ON TABLE notifications IS 'Notificações do usuário';

COMMENT ON FUNCTION calculate_level IS 'Calcula o nível baseado na quantidade de XP';
COMMENT ON FUNCTION add_user_xp IS 'Adiciona XP ao usuário e atualiza nível automaticamente';
COMMENT ON FUNCTION unlock_achievement IS 'Desbloqueia uma conquista para o usuário e adiciona XP';
