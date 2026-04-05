-- Migration 019: Username-based auth for kids
-- Kids login with username+password (no email needed)
-- Parents create kid accounts from their dashboard

-- Add username column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username) WHERE username IS NOT NULL;

-- Function: parent creates a kid account
-- Creates auth.users entry with synthetic email, then links kid to parent
CREATE OR REPLACE FUNCTION create_kid_account(
  p_parent_id UUID,
  p_kid_name TEXT,
  p_kid_username TEXT,
  p_kid_password TEXT,
  p_kid_age INTEGER DEFAULT NULL,
  p_kid_grade TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_parent profiles%ROWTYPE;
  v_synthetic_email TEXT;
  v_new_user_id UUID;
  v_kid_profile_id UUID;
  v_clean_username TEXT;
BEGIN
  -- Validate parent exists and is actually a parent
  SELECT * INTO v_parent FROM profiles WHERE id = p_parent_id AND user_type = 'parent';
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Parent not found');
  END IF;

  -- Clean and validate username
  v_clean_username := lower(trim(p_kid_username));

  IF length(v_clean_username) < 3 THEN
    RETURN json_build_object('success', false, 'error', 'Username must be at least 3 characters');
  END IF;

  IF length(v_clean_username) > 30 THEN
    RETURN json_build_object('success', false, 'error', 'Username must be at most 30 characters');
  END IF;

  IF v_clean_username !~ '^[a-z0-9._-]+$' THEN
    RETURN json_build_object('success', false, 'error', 'Username can only contain letters, numbers, dots, hyphens and underscores');
  END IF;

  -- Check username uniqueness
  IF EXISTS (SELECT 1 FROM profiles WHERE username = v_clean_username) THEN
    RETURN json_build_object('success', false, 'error', 'Username already taken');
  END IF;

  -- Validate password
  IF length(p_kid_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;

  -- Generate synthetic email
  v_synthetic_email := v_clean_username || '@studdo.app';

  -- Check synthetic email doesn't already exist in auth
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_synthetic_email) THEN
    RETURN json_build_object('success', false, 'error', 'Username already taken');
  END IF;

  -- Create auth user with synthetic email
  v_new_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    v_new_user_id,
    '00000000-0000-0000-0000-000000000000',
    v_synthetic_email,
    crypt(p_kid_password, gen_salt('bf')),
    now(), -- auto-confirm
    jsonb_build_object('name', p_kid_name, 'user_type', 'kid', 'username', v_clean_username),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    ''
  );

  -- Create identity for the user
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_new_user_id,
    v_new_user_id,
    v_new_user_id::text,
    'email',
    jsonb_build_object('sub', v_new_user_id::text, 'email', v_synthetic_email),
    now(),
    now(),
    now()
  );

  -- Wait for trigger to create profile, then update it
  -- The handle_new_user trigger creates the profile automatically
  -- We need to update it with username, age, grade

  -- Get the profile created by trigger
  SELECT id INTO v_kid_profile_id FROM profiles WHERE auth_id = v_new_user_id;

  IF v_kid_profile_id IS NULL THEN
    -- Trigger didn't fire or was slow, create manually
    INSERT INTO profiles (id, auth_id, name, email, user_type, username, age, grade)
    VALUES (gen_random_uuid(), v_new_user_id, p_kid_name, v_synthetic_email, 'kid', v_clean_username, p_kid_age, p_kid_grade)
    RETURNING id INTO v_kid_profile_id;
  ELSE
    UPDATE profiles
    SET username = v_clean_username, age = p_kid_age, grade = p_kid_grade
    WHERE id = v_kid_profile_id;
  END IF;

  -- Auto-link kid to parent
  INSERT INTO parent_kid_links (id, parent_id, kid_id)
  VALUES (gen_random_uuid(), p_parent_id, v_kid_profile_id)
  ON CONFLICT (parent_id, kid_id) DO NOTHING;

  -- Create user_stats for the kid
  INSERT INTO user_stats (user_id)
  VALUES (v_kid_profile_id)
  ON CONFLICT DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'kid_id', v_kid_profile_id,
    'username', v_clean_username
  );
END;
$$;

-- Function: lookup username to get synthetic email (for login)
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_clean TEXT;
BEGIN
  v_clean := lower(trim(p_username));

  SELECT email INTO v_email
  FROM profiles
  WHERE username = v_clean;

  IF v_email IS NULL THEN
    -- Try synthetic email pattern as fallback
    v_email := v_clean || '@studdo.app';
  END IF;

  RETURN v_email;
END;
$$;

-- Grant execute to authenticated and anon (login needs anon)
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_kid_account(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;
