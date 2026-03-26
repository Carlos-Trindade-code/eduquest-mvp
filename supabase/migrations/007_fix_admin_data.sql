-- ============================================================
-- Migration 007: Fix all admin data RPCs (idempotente)
-- ============================================================

-- 1. Fix get_all_profiles
--    Root cause: RETURNS TABLE with explicit VARCHAR(9)→TEXT mismatch
--    Fix: RETURNS SETOF profiles (no column redeclaration)
DROP FUNCTION IF EXISTS get_all_profiles();

CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_profiles() TO anon;

-- 2. Ensure feedback RPCs are accessible
GRANT EXECUTE ON FUNCTION get_all_feedback() TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_suggestions() TO authenticated;
GRANT EXECUTE ON FUNCTION update_suggestion_status(UUID, TEXT, TEXT) TO authenticated;
