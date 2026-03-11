-- EduQuest - Invite Code System for Parent-Kid Linking
-- Execute this in Supabase SQL Editor (supabase.com > SQL Editor)

-- =============================================
-- 1. ADD invite_code COLUMN TO profiles
-- =============================================
ALTER TABLE profiles ADD COLUMN invite_code VARCHAR(9) UNIQUE;

-- Partial index for fast lookup (only non-null codes)
CREATE INDEX idx_profiles_invite_code ON profiles(invite_code) WHERE invite_code IS NOT NULL;

-- =============================================
-- 2. FUNCTION: Generate unique invite code (EQ-XXXX)
-- =============================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'EQ-' || upper(substr(md5(random()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE invite_code = code) INTO exists_already;
    IF NOT exists_already THEN RETURN code; END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. UPDATE TRIGGER: Auto-generate invite_code for parents
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, name, email, user_type, invite_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'user_type', 'kid'),
    CASE WHEN COALESCE(new.raw_user_meta_data->>'user_type', 'kid') = 'parent'
         THEN generate_invite_code()
         ELSE NULL
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. RPC: Redeem invite code (kid calls to link to parent)
-- =============================================
CREATE OR REPLACE FUNCTION redeem_invite_code(code TEXT)
RETURNS JSON AS $$
DECLARE
  parent_profile profiles%ROWTYPE;
  kid_profile profiles%ROWTYPE;
  existing_link parent_kid_links%ROWTYPE;
BEGIN
  -- Find parent by invite code
  SELECT * INTO parent_profile
  FROM profiles
  WHERE invite_code = upper(code) AND user_type = 'parent';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Codigo invalido');
  END IF;

  -- Find the kid calling this function
  SELECT * INTO kid_profile
  FROM profiles
  WHERE auth_id = auth.uid() AND user_type = 'kid';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Perfil de estudante nao encontrado');
  END IF;

  -- Check if already linked
  SELECT * INTO existing_link
  FROM parent_kid_links
  WHERE parent_id = parent_profile.id AND kid_id = kid_profile.id;

  IF FOUND THEN
    RETURN json_build_object('success', true, 'parent_name', parent_profile.name, 'already_linked', true);
  END IF;

  -- Create the link
  INSERT INTO parent_kid_links (parent_id, kid_id)
  VALUES (parent_profile.id, kid_profile.id);

  RETURN json_build_object('success', true, 'parent_name', parent_profile.name, 'already_linked', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. BACKFILL: Generate codes for existing parents
-- =============================================
UPDATE profiles SET invite_code = generate_invite_code()
WHERE user_type = 'parent' AND invite_code IS NULL;
