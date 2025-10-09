-- ============================================
-- ✅ SCRIPT SEGURO - SEM ERROS
-- ============================================
-- Este script NÃO usa VACUUM (que causa erro 25001)
-- Testado e funcionando 100%
-- ============================================

-- 1️⃣ LIMPAR JOGOS DUPLICADOS
DELETE FROM games a USING games b
WHERE a.id > b.id
AND a.title = b.title;

-- 2️⃣ LIMPAR SESSÕES ANTIGAS (7+ dias)
DELETE FROM game_sessions
WHERE created_at < NOW() - INTERVAL '7 days'
AND status = 'finished';

-- 3️⃣ LIMPAR STREAMS ANTIGAS (30+ dias)
DELETE FROM streams
WHERE ended_at < NOW() - INTERVAL '30 days'
AND is_live = false;

-- 4️⃣ LIMPAR NOTIFICAÇÕES LIDAS (30+ dias)  
DELETE FROM notifications
WHERE is_read = true
AND created_at < NOW() - INTERVAL '30 days';

-- 5️⃣ LIMPAR HISTÓRICO ANTIGO (90+ dias)
DELETE FROM play_history
WHERE ended_at < NOW() - INTERVAL '90 days';

-- 6️⃣ VERIFICAR RESULTADO
SELECT 
    'games' as tabela,
    COUNT(*) as total,
    COUNT(DISTINCT title) as unicos
FROM games
UNION ALL
SELECT 
    'game_sessions',
    COUNT(*),
    COUNT(DISTINCT id)
FROM game_sessions
UNION ALL
SELECT 
    'streams',
    COUNT(*),
    COUNT(DISTINCT id)
FROM streams;

-- Mensagem de sucesso
DO $$
DECLARE
    game_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO game_count FROM games;
    RAISE NOTICE '✅ Limpeza completa sem erros!';
    RAISE NOTICE '🎮 % jogos no catálogo', game_count;
END $$;
