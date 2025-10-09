-- ============================================
-- 🗑️ DELETAR TABELAS NÃO UTILIZADAS
-- ============================================
-- Remove tabelas antigas/não usadas do projeto
-- ============================================

-- Listar todas as tabelas antes de deletar
DO $$
DECLARE
    tabelas TEXT;
BEGIN
    SELECT string_agg(tablename, ', ') INTO tabelas
    FROM pg_tables 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '📋 TABELAS ATUAIS: %', tabelas;
END $$;

-- Deletar tabelas antigas/não usadas (se existirem)
DROP TABLE IF EXISTS old_sessions CASCADE;
DROP TABLE IF EXISTS temp_users CASCADE;
DROP TABLE IF EXISTS cache_data CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS temporary_data CASCADE;
DROP TABLE IF EXISTS legacy_games CASCADE;
DROP TABLE IF EXISTS backup_users CASCADE;
DROP TABLE IF EXISTS test_table CASCADE;

-- Verificar políticas RLS órfãs (sem tabela)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = r.tablename
        ) THEN
            RAISE NOTICE '⚠️  Política órfã encontrada: % na tabela % (que não existe)', r.policyname, r.tablename;
        END IF;
    END LOOP;
END $$;

-- Listar tabelas que DEVEM existir (whitelist)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABELAS ESSENCIAIS (devem existir):';
    RAISE NOTICE '   1. users - Perfis de usuários';
    RAISE NOTICE '   2. games - Catálogo de jogos';
    RAISE NOTICE '   3. game_sessions - Salas multiplayer';
    RAISE NOTICE '   4. streams - Transmissões ao vivo';
    RAISE NOTICE '   5. stream_viewers - Espectadores';
    RAISE NOTICE '   6. user_stats - Estatísticas/XP';
    RAISE NOTICE '   7. achievements - Conquistas';
    RAISE NOTICE '   8. user_achievements - Conquistas desbloqueadas';
    RAISE NOTICE '   9. play_history - Histórico';
    RAISE NOTICE '   10. friendships - Amigos';
    RAISE NOTICE '   11. notifications - Notificações';
END $$;

-- Verificar quais tabelas realmente existem
SELECT 
    tablename as "Tabela",
    CASE 
        WHEN tablename IN ('users', 'games', 'game_sessions', 'streams', 'stream_viewers', 
                          'user_stats', 'achievements', 'user_achievements', 'play_history', 
                          'friendships', 'notifications') 
        THEN '✅ ESSENCIAL'
        ELSE '❓ DESCONHECIDA'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Mensagem final
DO $$
DECLARE
    total INTEGER;
    essenciais INTEGER;
BEGIN
    SELECT COUNT(*) INTO total FROM pg_tables WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO essenciais 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'games', 'game_sessions', 'streams', 'stream_viewers', 
                      'user_stats', 'achievements', 'user_achievements', 'play_history', 
                      'friendships', 'notifications');
    
    RAISE NOTICE '';
    RAISE NOTICE '🧹 Limpeza concluída!';
    RAISE NOTICE '📊 Total de tabelas: %', total;
    RAISE NOTICE '✅ Tabelas essenciais: %', essenciais;
    
    IF total > essenciais THEN
        RAISE NOTICE '⚠️  % tabelas extras encontradas (verifique a lista acima)', total - essenciais;
    ELSE
        RAISE NOTICE '🎉 Apenas tabelas essenciais presentes!';
    END IF;
END $$;
