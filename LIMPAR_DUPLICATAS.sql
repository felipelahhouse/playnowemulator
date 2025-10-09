-- ============================================
-- 🧹 LIMPAR JOGOS DUPLICADOS
-- ============================================
-- Remove jogos duplicados mantendo apenas 1 de cada
-- ============================================

-- Deletar duplicatas mantendo o mais antigo de cada título
DELETE FROM games a USING games b
WHERE a.id > b.id
AND a.title = b.title;

-- Verificar resultado
SELECT 
    COUNT(*) as total_jogos,
    COUNT(DISTINCT title) as jogos_unicos
FROM games;

-- Listar jogos únicos
SELECT title, platform, year
FROM games
ORDER BY title;

-- Mensagem de sucesso
DO $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total FROM games;
    RAISE NOTICE '🧹 Duplicatas removidas!';
    RAISE NOTICE '✅ % jogos únicos no catálogo!', total;
END $$;
