-- ============================================================
-- Migration 006: Fix admin RPCs
-- Problemas corrigidos:
--   1. get_admin_metrics usava "tutor_sessions" — tabela real é "sessions"
--   2. Adiciona get_all_profiles como SECURITY DEFINER (bypassa RLS)
--   3. Garante que todas as RPCs admin existam e estejam corretas
-- ============================================================

-- 1. Corrige get_admin_metrics (tutor_sessions → sessions)
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users',        (SELECT count(*) FROM profiles),
    'total_kids',         (SELECT count(*) FROM profiles WHERE user_type = 'kid'),
    'total_parents',      (SELECT count(*) FROM profiles WHERE user_type = 'parent'),
    'total_sessions',     (SELECT count(*) FROM sessions),
    'active_today',       (SELECT count(DISTINCT kid_id) FROM sessions WHERE created_at >= CURRENT_DATE),
    'total_suggestions',  (SELECT count(*) FROM suggestions),
    'pending_suggestions',(SELECT count(*) FROM suggestions WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$;

-- 2. Adiciona get_all_profiles (SECURITY DEFINER bypassa RLS)
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT * FROM profiles ORDER BY created_at DESC;
END;
$$;

-- 3. Garante que get_all_suggestions existe e está correto
CREATE OR REPLACE FUNCTION get_all_suggestions()
RETURNS SETOF suggestions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM suggestions ORDER BY created_at DESC;
END;
$$;

-- 4. Garante que update_suggestion_status existe
CREATE OR REPLACE FUNCTION update_suggestion_status(
  suggestion_id UUID,
  new_status TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE suggestions
  SET status = new_status, admin_notes = COALESCE(notes, admin_notes)
  WHERE id = suggestion_id;
END;
$$;
