-- ==========================================
-- CORRIGIR WARNINGS DE SEARCH_PATH
-- Adiciona search_path seguro em todas as funções
-- ==========================================

-- 1. Função calculate_level
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0)) + 1);
END;
$$;

-- 2. Função add_user_xp
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. Função unlock_achievement
CREATE OR REPLACE FUNCTION unlock_achievement(p_user_id UUID, p_achievement_key VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 4. Função create_user_stats (trigger function)
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  PERFORM unlock_achievement(NEW.id, 'first_login');
  
  RETURN NEW;
END;
$$;

-- 5. Função update_updated_at_column (se existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ==========================================
-- VERIFICAÇÃO
-- Execute esta query para confirmar:
-- ==========================================
-- SELECT 
--   p.proname as function_name,
--   pg_get_function_arguments(p.oid) as arguments,
--   CASE 
--     WHEN prosecdef THEN 'SECURITY DEFINER' 
--     ELSE 'SECURITY INVOKER' 
--   END as security,
--   proconfig as search_path
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname IN ('calculate_level', 'add_user_xp', 'unlock_achievement', 'create_user_stats', 'update_updated_at_column')
-- ORDER BY p.proname;

-- 6. Função handle_new_user (se existir)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 7. Função cleanup_old_sessions (se existir)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deletar sessões antigas (mais de 24h inativas)
  DELETE FROM game_sessions
  WHERE status = 'finished'
    AND updated_at < NOW() - INTERVAL '24 hours';
    
  -- Deletar sessões esperando há mais de 1h
  DELETE FROM game_sessions
  WHERE status = 'waiting'
    AND created_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- FIM ✅
