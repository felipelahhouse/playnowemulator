-- ============================================
-- 🔧 ADICIONAR TABELAS FALTANTES (SEM DELETAR)
-- ============================================
-- Este script adiciona apenas o que está faltando
-- SEM deletar dados existentes
-- ============================================

-- Criar tabelas apenas se não existirem

-- Tabela de estatísticas de usuário
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_play_time INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    rarity TEXT DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas desbloqueadas
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Tabela de histórico de jogatina
CREATE TABLE IF NOT EXISTS play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    play_time INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de amizades
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de streams
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    streamer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    stream_key TEXT UNIQUE NOT NULL,
    viewer_count INTEGER DEFAULT 0,
    is_live BOOLEAN DEFAULT true,
    thumbnail_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de viewers
CREATE TABLE IF NOT EXISTS stream_viewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON user_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_user ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_game ON play_history(game_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_streamer ON streams(streamer_id);
CREATE INDEX IF NOT EXISTS idx_streams_live ON streams(is_live);

-- Habilitar RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (com IF NOT EXISTS não é possível, então usamos DROP IF EXISTS primeiro)

-- USER_STATS
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats"
    ON user_stats FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats"
    ON user_stats FOR UPDATE
    USING (user_id = auth.uid());

-- ACHIEVEMENTS
DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements"
    ON achievements FOR SELECT
    USING (true);

-- USER_ACHIEVEMENTS
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unlock achievements" ON user_achievements;
CREATE POLICY "Users can unlock achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- PLAY_HISTORY
DROP POLICY IF EXISTS "Users can view own play history" ON play_history;
CREATE POLICY "Users can view own play history"
    ON play_history FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create play history" ON play_history;
CREATE POLICY "Users can create play history"
    ON play_history FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- FRIENDSHIPS
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
CREATE POLICY "Users can view own friendships"
    ON friendships FOR SELECT
    USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
CREATE POLICY "Users can create friendships"
    ON friendships FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- STREAMS
DROP POLICY IF EXISTS "Anyone can view live streams" ON streams;
CREATE POLICY "Anyone can view live streams"
    ON streams FOR SELECT
    USING (is_live = true OR streamer_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create streams" ON streams;
CREATE POLICY "Authenticated users can create streams"
    ON streams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND streamer_id = auth.uid());

DROP POLICY IF EXISTS "Streamer can update own streams" ON streams;
CREATE POLICY "Streamer can update own streams"
    ON streams FOR UPDATE
    USING (streamer_id = auth.uid());

-- STREAM_VIEWERS
DROP POLICY IF EXISTS "Anyone can view stream viewers" ON stream_viewers;
CREATE POLICY "Anyone can view stream viewers"
    ON stream_viewers FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can join streams" ON stream_viewers;
CREATE POLICY "Users can join streams"
    ON stream_viewers FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Inserir conquistas se a tabela estiver vazia
INSERT INTO achievements (title, description, xp_reward, coin_reward, requirement_type, requirement_value, rarity)
SELECT * FROM (VALUES
    ('First Steps', 'Jogue seu primeiro jogo', 100, 50, 'games_played', 1, 'common'),
    ('Gaming Enthusiast', 'Jogue 10 jogos diferentes', 500, 250, 'games_played', 10, 'rare'),
    ('Speedrunner', 'Complete um jogo em menos de 1 hora', 1000, 500, 'play_time', 60, 'epic'),
    ('Champion', 'Vença 100 partidas multiplayer', 5000, 2500, 'wins', 100, 'legendary'),
    ('Social Butterfly', 'Adicione 10 amigos', 300, 150, 'friends', 10, 'rare')
) AS t(title, description, xp_reward, coin_reward, requirement_type, requirement_value, rarity)
WHERE NOT EXISTS (SELECT 1 FROM achievements LIMIT 1);

-- Criar stats para usuários existentes que não tem
INSERT INTO user_stats (user_id)
SELECT u.id FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_stats us WHERE us.user_id = u.id
);

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Tabelas faltantes adicionadas!';
    RAISE NOTICE '✅ RLS configurado';
    RAISE NOTICE '✅ Políticas criadas';
    RAISE NOTICE '✅ Conquistas adicionadas';
    RAISE NOTICE '✅ Stats criadas para usuários existentes';
END $$;
