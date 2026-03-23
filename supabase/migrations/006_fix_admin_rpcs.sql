-- ============================================================
-- Migration 006: Fix admin RPCs (idempotente — pode rodar várias vezes)
-- ============================================================

-- 1. Cria tabela suggestions se não existir
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'done')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert suggestions" ON suggestions;
CREATE POLICY "Anyone can insert suggestions" ON suggestions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view own suggestions" ON suggestions;
CREATE POLICY "Users can view own suggestions" ON suggestions FOR SELECT USING (auth.uid() = user_id);

-- 2. get_admin_metrics (corrigido: sessions não tutor_sessions)
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_users',         (SELECT count(*) FROM public.profiles),
    'total_kids',          (SELECT count(*) FROM public.profiles WHERE user_type = 'kid'),
    'total_parents',       (SELECT count(*) FROM public.profiles WHERE user_type = 'parent'),
    'total_sessions',      (SELECT count(*) FROM public.sessions),
    'active_today',        (SELECT count(DISTINCT kid_id) FROM public.sessions WHERE created_at >= CURRENT_DATE),
    'total_suggestions',   (SELECT count(*) FROM public.suggestions),
    'pending_suggestions', (SELECT count(*) FROM public.suggestions WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$;

-- 3. get_all_profiles (SECURITY DEFINER bypassa RLS — admin vê todos)
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS TABLE (
  id UUID, auth_id UUID, user_type TEXT, name TEXT, email TEXT,
  avatar_url TEXT, language VARCHAR, age INTEGER, grade VARCHAR,
  invite_code TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT
      p.id, p.auth_id, p.user_type, p.name, p.email,
      p.avatar_url, p.language, p.age, p.grade,
      p.invite_code, p.created_at, p.updated_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

-- 4. get_all_suggestions
CREATE OR REPLACE FUNCTION get_all_suggestions()
RETURNS SETOF suggestions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.suggestions ORDER BY created_at DESC;
END;
$$;

-- 5. update_suggestion_status
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
  UPDATE public.suggestions
  SET status = new_status, admin_notes = COALESCE(notes, admin_notes)
  WHERE id = suggestion_id;
END;
$$;
