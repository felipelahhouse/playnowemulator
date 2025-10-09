-- ============================================
-- 🔥 RESET COMPLETO DO BANCO DE DADOS
-- ============================================
-- Este script vai:
-- 1. Deletar TODAS as tabelas antigas
-- 2. Recriar tabelas do zero
-- 3. Configurar RLS (Row Level Security)
-- 4. Adicionar políticas de acesso corretas
-- 5. Criar triggers e funções necessárias
-- ============================================

-- ============================================
-- PASSO 1: LIMPAR TUDO (DELETE CASCADE)
-- ============================================

-- Dropar todas as políticas RLS primeiro
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

DROP POLICY IF EXISTS "Public games are viewable by everyone" ON games;
DROP POLICY IF EXISTS "Enable read access for all users" ON games;

DROP POLICY IF EXISTS "Users can view game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can create game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON game_sessions;
DROP POLICY IF EXISTS "Enable read access for all users" ON game_sessions;
DROP POLICY IF EXISTS "Enable update for session participants" ON game_sessions;

DROP POLICY IF EXISTS "Users can view streams" ON streams;
DROP POLICY IF EXISTS "Users can create streams" ON streams;
DROP POLICY IF EXISTS "Users can update own streams" ON streams;

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;

DROP POLICY IF EXISTS "Users can view achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;

-- Dropar triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_stats_on_play ON play_history;
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
DROP TRIGGER IF EXISTS update_streams_updated_at ON streams;

-- Dropar funções
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_user_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_sessions() CASCADE;
DROP FUNCTION IF EXISTS get_user_rank(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_leaderboard(integer) CASCADE;

-- Dropar tabelas (ordem reversa de dependências)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS play_history CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS stream_viewers CASCADE;
DROP TABLE IF EXISTS streams CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- PASSO 2: CRIAR TABELAS DO ZERO
-- ============================================

-- Tabela de usuários (perfis públicos)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de jogos
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    platform TEXT NOT NULL, -- 'SNES', 'NES', 'Genesis', etc
    cover_url TEXT,
    rom_url TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    publisher TEXT,
    multiplayer_support BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões multiplayer
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    host_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_name TEXT NOT NULL,
    max_players INTEGER DEFAULT 2,
    current_players INTEGER DEFAULT 1,
    status TEXT DEFAULT 'waiting', -- 'waiting', 'playing', 'finished'
    is_public BOOLEAN DEFAULT true,
    room_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de streams ao vivo
CREATE TABLE streams (
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

-- Tabela de visualizadores de stream
CREATE TABLE stream_viewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES streams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de estatísticas de usuário
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_play_time INTEGER DEFAULT 0, -- em minutos
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

-- Tabela de conquistas (achievements)
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    requirement_type TEXT NOT NULL, -- 'play_time', 'games_played', 'wins', etc
    requirement_value INTEGER NOT NULL,
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conquistas desbloqueadas por usuários
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Tabela de histórico de jogatina
CREATE TABLE play_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    play_time INTEGER DEFAULT 0, -- em minutos
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de amizades
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Tabela de notificações
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'friend_request', 'achievement', 'game_invite', etc
    title TEXT NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASSO 3: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_online ON users(is_online);

CREATE INDEX idx_games_platform ON games(platform);
CREATE INDEX idx_games_genre ON games(genre);

CREATE INDEX idx_game_sessions_host ON game_sessions(host_user_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_game ON game_sessions(game_id);

CREATE INDEX idx_streams_streamer ON streams(streamer_id);
CREATE INDEX idx_streams_live ON streams(is_live);

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_stats_xp ON user_stats(xp DESC);

CREATE INDEX idx_play_history_user ON play_history(user_id);
CREATE INDEX idx_play_history_game ON play_history(game_id);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- PASSO 4: HABILITAR RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 5: CRIAR POLÍTICAS RLS
-- ============================================

-- Políticas para USERS
CREATE POLICY "Anyone can view profiles"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Políticas para GAMES (público - todos podem ver)
CREATE POLICY "Anyone can view games"
    ON games FOR SELECT
    USING (true);

-- Políticas para GAME_SESSIONS
CREATE POLICY "Anyone can view public sessions"
    ON game_sessions FOR SELECT
    USING (is_public = true OR host_user_id = auth.uid());

CREATE POLICY "Authenticated users can create sessions"
    ON game_sessions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND host_user_id = auth.uid());

CREATE POLICY "Host can update own sessions"
    ON game_sessions FOR UPDATE
    USING (host_user_id = auth.uid())
    WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Host can delete own sessions"
    ON game_sessions FOR DELETE
    USING (host_user_id = auth.uid());

-- Políticas para STREAMS
CREATE POLICY "Anyone can view live streams"
    ON streams FOR SELECT
    USING (is_live = true OR streamer_id = auth.uid());

CREATE POLICY "Authenticated users can create streams"
    ON streams FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND streamer_id = auth.uid());

CREATE POLICY "Streamer can update own streams"
    ON streams FOR UPDATE
    USING (streamer_id = auth.uid())
    WITH CHECK (streamer_id = auth.uid());

CREATE POLICY "Streamer can delete own streams"
    ON streams FOR DELETE
    USING (streamer_id = auth.uid());

-- Políticas para STREAM_VIEWERS
CREATE POLICY "Anyone can view stream viewers"
    ON stream_viewers FOR SELECT
    USING (true);

CREATE POLICY "Users can join streams"
    ON stream_viewers FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Políticas para USER_STATS
CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stats"
    ON user_stats FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stats"
    ON user_stats FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Políticas para ACHIEVEMENTS (público)
CREATE POLICY "Anyone can view achievements"
    ON achievements FOR SELECT
    USING (true);

-- Políticas para USER_ACHIEVEMENTS
CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can unlock achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Políticas para PLAY_HISTORY
CREATE POLICY "Users can view own play history"
    ON play_history FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create play history"
    ON play_history FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Políticas para FRIENDSHIPS
CREATE POLICY "Users can view own friendships"
    ON friendships FOR SELECT
    USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendships"
    ON friendships FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own friendships"
    ON friendships FOR UPDATE
    USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Políticas para NOTIFICATIONS
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================
-- PASSO 6: CRIAR FUNÇÕES E TRIGGERS
-- ============================================

-- Função para criar perfil automaticamente quando novo usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (id, email, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Criar estatísticas iniciais
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streams_updated_at
    BEFORE UPDATE ON streams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estatísticas de usuário
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL THEN
        UPDATE user_stats
        SET 
            total_play_time = total_play_time + NEW.play_time,
            games_played = games_played + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para atualizar stats quando termina uma sessão
CREATE TRIGGER update_user_stats_on_play
    AFTER UPDATE ON play_history
    FOR EACH ROW
    WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
    EXECUTE FUNCTION update_user_stats();

-- Função para limpar sessões antigas
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Deletar sessões com mais de 24 horas
    DELETE FROM game_sessions
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND status != 'playing';
    
    -- Finalizar streams com mais de 12 horas
    UPDATE streams
    SET is_live = false, ended_at = NOW()
    WHERE started_at < NOW() - INTERVAL '12 hours'
    AND is_live = true
    AND ended_at IS NULL;
END;
$$;

-- Função para obter ranking de usuário
CREATE OR REPLACE FUNCTION get_user_rank(user_uuid UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO user_rank
    FROM user_stats
    WHERE xp > (SELECT xp FROM user_stats WHERE user_id = user_uuid);
    
    RETURN user_rank;
END;
$$;

-- Função para obter leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    xp INTEGER,
    level INTEGER,
    games_played INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY us.xp DESC) as rank,
        u.id as user_id,
        u.username,
        u.avatar_url,
        us.xp,
        us.level,
        us.games_played
    FROM user_stats us
    JOIN users u ON u.id = us.user_id
    ORDER BY us.xp DESC
    LIMIT limit_count;
END;
$$;

-- ============================================
-- PASSO 7: INSERIR DADOS INICIAIS
-- ============================================

-- Inserir algumas conquistas básicas
INSERT INTO achievements (title, description, icon_url, xp_reward, coin_reward, requirement_type, requirement_value, rarity)
VALUES
    ('First Steps', 'Jogue seu primeiro jogo', 'https://i.imgur.com/achievement1.png', 100, 50, 'games_played', 1, 'common'),
    ('Gaming Enthusiast', 'Jogue 10 jogos diferentes', 'https://i.imgur.com/achievement2.png', 500, 250, 'games_played', 10, 'rare'),
    ('Speedrunner', 'Complete um jogo em menos de 1 hora', 'https://i.imgur.com/achievement3.png', 1000, 500, 'play_time', 60, 'epic'),
    ('Champion', 'Vença 100 partidas multiplayer', 'https://i.imgur.com/achievement4.png', 5000, 2500, 'wins', 100, 'legendary'),
    ('Social Butterfly', 'Adicione 10 amigos', 'https://i.imgur.com/achievement5.png', 300, 150, 'friends', 10, 'rare');

-- ============================================
-- FINALIZADO! ✅
-- ============================================

-- Verificar se tudo foi criado
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'game_sessions', COUNT(*) FROM game_sessions
UNION ALL
SELECT 'streams', COUNT(*) FROM streams
UNION ALL
SELECT 'user_stats', COUNT(*) FROM user_stats
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ DATABASE RESET COMPLETO!';
    RAISE NOTICE '✅ Todas as tabelas foram recriadas';
    RAISE NOTICE '✅ RLS configurado corretamente';
    RAISE NOTICE '✅ Políticas de acesso criadas';
    RAISE NOTICE '✅ Triggers e funções instaladas';
    RAISE NOTICE '✅ Conquistas iniciais adicionadas';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Seu banco de dados está pronto para uso!';
END $$;
