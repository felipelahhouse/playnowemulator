-- ==========================================
-- CORRIGIR RLS SEM POLICIES
-- Adiciona policies nas tabelas que faltam
-- ==========================================

-- Verificar se essas são colunas ou tabelas separadas
-- Se forem TABELAS separadas (improvável):

-- Para tabela host_user_id (se existir como tabela)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'host_user_id'
    ) THEN
        -- Criar policy básica
        DROP POLICY IF EXISTS "Users can view all" ON host_user_id;
        CREATE POLICY "Users can view all"
          ON host_user_id FOR SELECT
          TO authenticated
          USING (true);
    END IF;
END $$;

-- Para tabela streamer_id (se existir como tabela)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'streamer_id'
    ) THEN
        -- Criar policy básica
        DROP POLICY IF EXISTS "Users can view all" ON streamer_id;
        CREATE POLICY "Users can view all"
          ON streamer_id FOR SELECT
          TO authenticated
          USING (true);
    END IF;
END $$;

-- ==========================================
-- VERIFICAÇÃO: Ver quais tabelas realmente existem
-- Execute isso para confirmar:
-- ==========================================

-- SELECT 
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('host_user_id', 'streamer_id')
-- ORDER BY tablename;

-- OU ver TODAS as tabelas com RLS sem policies:

-- SELECT 
--   t.tablename,
--   COUNT(p.policyname) as policy_count
-- FROM pg_tables t
-- LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
-- WHERE t.schemaname = 'public'
--   AND t.rowsecurity = true
-- GROUP BY t.tablename, t.rowsecurity
-- HAVING COUNT(p.policyname) = 0
-- ORDER BY t.tablename;

-- FIM ✅
