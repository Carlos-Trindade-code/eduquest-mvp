-- ============================================================
-- Migration 005: Fix trigger search_path + RLS recursion
-- ============================================================
-- Root cause: supabase_auth_admin role has search_path=auth only.
-- handle_new_user() called generate_invite_code() without public.
-- prefix → function not found → "Database error saving new user".
--
-- Fixes:
-- 1. Add SET search_path = public to both trigger functions
-- 2. Use public.generate_invite_code() explicitly
-- 3. Fix infinite recursion in profiles RLS SELECT policy
-- 4. Add INSERT policy to profiles (defensive)
-- ============================================================

-- 1. Fix handle_new_user: add SET search_path + explicit schema on generate_invite_code()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, name, email, user_type, invite_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'user_type', 'kid'),
    CASE WHEN COALESCE(new.raw_user_meta_data->>'user_type', 'kid') = 'parent'
         THEN public.generate_invite_code()
         ELSE NULL
    END
  );
  RETURN new;
END;
$$;

-- 2. Fix handle_new_profile: add SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Ensure ownership
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
ALTER FUNCTION public.handle_new_profile() OWNER TO postgres;
ALTER FUNCTION public.generate_invite_code() OWNER TO postgres;

-- 3. Add INSERT policy to profiles (defensive)
DROP POLICY IF EXISTS "Service can insert profiles" ON profiles;
CREATE POLICY "Service can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- 4. Fix infinite recursion in "Parents can view kids profiles" policy
--    (querying profiles FROM INSIDE a profiles SELECT policy → infinite loop)
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1
$$;

ALTER FUNCTION public.get_my_profile_id() OWNER TO postgres;

DROP POLICY IF EXISTS "Parents can view kids profiles" ON profiles;
CREATE POLICY "Parents can view kids profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = public.get_my_profile_id()
    )
  );

-- 5. Fix same recursion in user_stats and parent_kid_links policies
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (user_id = public.get_my_profile_id());

DROP POLICY IF EXISTS "Parents can create links" ON parent_kid_links;
CREATE POLICY "Parents can create links"
  ON parent_kid_links FOR INSERT
  WITH CHECK (parent_id = public.get_my_profile_id());

DROP POLICY IF EXISTS "Parents can view own links" ON parent_kid_links;
CREATE POLICY "Parents can view own links"
  ON parent_kid_links FOR SELECT
  USING (parent_id = public.get_my_profile_id());
