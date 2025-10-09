-- ============================================
-- 🧹 LIMPAR TABELAS NÃO USADAS
-- ============================================
-- Remove tabelas antigas, duplicadas ou não usadas
-- ============================================

-- 1. Verificar quais tabelas existem
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Dropar tabelas completamente não usadas no código
-- (Estas tabelas não aparecem em nenhum componente React)

-- DROP TABLE IF EXISTS old_games CASCADE;
-- DROP TABLE IF EXISTS legacy_users CASCADE;
-- Adicione aqui tabelas antigas que você não usa

-- 3. Limpar dados antigos/inválidos

-- Deletar sessões de multiplayer muito antigas (mais de 7 dias)
DELETE FROM game_sessions
WHERE created_at < NOW() - INTERVAL '7 days'
AND status = 'finished';

-- Deletar streams que terminaram há mais de 30 dias
DELETE FROM streams
WHERE ended_at < NOW() - INTERVAL '30 days'
AND is_live = false;

-- Deletar notificações lidas há mais de 30 dias
DELETE FROM notifications
WHERE is_read = true
AND created_at < NOW() - INTERVAL '30 days';

-- Deletar histórico de jogatina muito antigo (mais de 90 dias)
DELETE FROM play_history
WHERE ended_at < NOW() - INTERVAL '90 days';

-- 4. Limpar jogos duplicados (se ainda houver)
DELETE FROM games a USING games b
WHERE a.id > b.id
AND a.title = b.title;

-- 5. Verificar espaço usado
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Mensagem de sucesso
DO $$
DECLARE
    game_count INTEGER;
    session_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO game_count FROM games;
    SELECT COUNT(*) INTO session_count FROM game_sessions WHERE status = 'waiting';
    
    RAISE NOTICE '✅ Limpeza completa!';
    RAISE NOTICE '🎮 % jogos únicos no catálogo', game_count;
    RAISE NOTICE '🎯 % sessões multiplayer ativas', session_count;
    RAISE NOTICE '🧹 Dados antigos removidos';
    RAISE NOTICE '⚡ Banco otimizado!';
END $$;
