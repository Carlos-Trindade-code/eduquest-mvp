-- =============================================================================
-- CONSOLIDATED SAFE-TO-RERUN MIGRATION SCRIPT (010 - 019)
-- Generated: 2026-04-05
--
-- This script combines migrations 010 through 019 into a single idempotent
-- script that is safe to run in the Supabase SQL Editor even if some or all
-- of these migrations have already been applied.
--
-- Safety rules applied:
--   - CREATE TABLE uses IF NOT EXISTS
--   - CREATE INDEX uses IF NOT EXISTS
--   - ALTER TABLE ADD COLUMN uses IF NOT EXISTS
--   - CREATE FUNCTION uses CREATE OR REPLACE FUNCTION
--   - CREATE POLICY is preceded by DROP POLICY IF EXISTS
--   - INSERT INTO storage.buckets uses ON CONFLICT DO NOTHING
--   - CREATE TRIGGER is preceded by DROP TRIGGER IF EXISTS
--   - ENABLE ROW LEVEL SECURITY is idempotent by nature
-- =============================================================================


-- ===========================================
-- Migration 010: Supabase Storage bucket para materiais
-- ===========================================

-- Criar bucket 'materials' (public read, authenticated upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS: usuarios autenticados podem fazer upload
DROP POLICY IF EXISTS "Authenticated users can upload materials" ON storage.objects;
CREATE POLICY "Authenticated users can upload materials"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'materials');

-- RLS: qualquer um pode ver (public bucket)
DROP POLICY IF EXISTS "Anyone can view materials" ON storage.objects;
CREATE POLICY "Anyone can view materials"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'materials');

-- RLS: usuarios podem deletar seus proprios arquivos
DROP POLICY IF EXISTS "Users can delete own materials" ON storage.objects;
CREATE POLICY "Users can delete own materials"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: usuarios podem atualizar seus proprios arquivos
DROP POLICY IF EXISTS "Users can update own materials" ON storage.objects;
CREATE POLICY "Users can update own materials"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'materials'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ===========================================
-- Migration 011: Tabela materials (biblioteca de materiais)
-- ===========================================

-- Helper function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Tabela principal de materiais
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL CHECK (owner_type IN ('kid', 'parent', 'teacher')),
  kid_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_name TEXT,
  file_size INTEGER,
  content_text TEXT,
  subject TEXT,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_materials_owner ON materials(owner_id);
CREATE INDEX IF NOT EXISTS idx_materials_kid ON materials(kid_id);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject);

-- Habilitar RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Kids veem seus proprios materiais + materiais que pais enviaram para eles
DROP POLICY IF EXISTS "Kids view own and parent materials" ON materials;
CREATE POLICY "Kids view own and parent materials"
ON materials FOR SELECT
USING (
  owner_id = public.get_my_profile_id()
  OR kid_id = public.get_my_profile_id()
);

-- Kids podem inserir seus proprios materiais
DROP POLICY IF EXISTS "Kids insert own materials" ON materials;
CREATE POLICY "Kids insert own materials"
ON materials FOR INSERT
WITH CHECK (owner_id = public.get_my_profile_id());

-- Kids podem deletar seus proprios materiais
DROP POLICY IF EXISTS "Kids delete own materials" ON materials;
CREATE POLICY "Kids delete own materials"
ON materials FOR DELETE
USING (owner_id = public.get_my_profile_id());

-- Kids podem atualizar seus proprios materiais
DROP POLICY IF EXISTS "Kids update own materials" ON materials;
CREATE POLICY "Kids update own materials"
ON materials FOR UPDATE
USING (owner_id = public.get_my_profile_id());

-- Pais veem materiais proprios + dos filhos linkados
DROP POLICY IF EXISTS "Parents view kid materials" ON materials;
CREATE POLICY "Parents view kid materials"
ON materials FOR SELECT
USING (
  owner_id = public.get_my_profile_id()
  OR kid_id IN (
    SELECT kid_id FROM parent_kid_links
    WHERE parent_id = public.get_my_profile_id()
  )
);

-- Pais podem inserir materiais para seus filhos
DROP POLICY IF EXISTS "Parents insert materials for kids" ON materials;
CREATE POLICY "Parents insert materials for kids"
ON materials FOR INSERT
WITH CHECK (
  owner_id = public.get_my_profile_id()
  AND (
    kid_id IS NULL
    OR kid_id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = public.get_my_profile_id()
    )
  )
);

-- Pais podem deletar materiais que eles mesmos enviaram
DROP POLICY IF EXISTS "Parents delete own materials" ON materials;
CREATE POLICY "Parents delete own materials"
ON materials FOR DELETE
USING (owner_id = public.get_my_profile_id());

-- Pais podem atualizar materiais que eles mesmos enviaram
DROP POLICY IF EXISTS "Parents update own materials" ON materials;
CREATE POLICY "Parents update own materials"
ON materials FOR UPDATE
USING (owner_id = public.get_my_profile_id());


-- ===========================================
-- Migration 012: Guided Activities (Estudar Juntos)
-- ===========================================

CREATE TABLE IF NOT EXISTS guided_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz', 'reading', 'exercise', 'review')),
  material_ids UUID[] DEFAULT '{}',
  questions JSONB,
  instructions TEXT,
  parent_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  kid_score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_guided_activities_parent ON guided_activities(parent_id);
CREATE INDEX IF NOT EXISTS idx_guided_activities_kid ON guided_activities(kid_id);
CREATE INDEX IF NOT EXISTS idx_guided_activities_status ON guided_activities(status);

-- Habilitar RLS
ALTER TABLE guided_activities ENABLE ROW LEVEL SECURITY;

-- Pais podem fazer CRUD nas proprias atividades
DROP POLICY IF EXISTS "Parents manage own activities" ON guided_activities;
CREATE POLICY "Parents manage own activities"
ON guided_activities FOR ALL
USING (parent_id = public.get_my_profile_id());

-- Kids podem ver atividades atribuidas a eles
DROP POLICY IF EXISTS "Kids view own activities" ON guided_activities;
CREATE POLICY "Kids view own activities"
ON guided_activities FOR SELECT
USING (kid_id = public.get_my_profile_id());

-- Kids podem atualizar status das suas atividades
DROP POLICY IF EXISTS "Kids update own activity status" ON guided_activities;
CREATE POLICY "Kids update own activity status"
ON guided_activities FOR UPDATE
USING (kid_id = public.get_my_profile_id())
WITH CHECK (kid_id = public.get_my_profile_id());


-- ===========================================
-- Migration 013: Add missing columns to profiles table
-- ===========================================

-- age_group: stores the user's age bracket (used for adaptive UI and tutor prompts)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_group VARCHAR(5) DEFAULT '10-12';

-- behavioral_profile: adaptive learning profile (default, tdah, anxiety, gifted)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS behavioral_profile VARCHAR(20) DEFAULT 'default';

-- Add comment for documentation
COMMENT ON COLUMN profiles.age_group IS 'Age bracket: 4-6, 7-9, 10-12, 13-15, 16-18';
COMMENT ON COLUMN profiles.behavioral_profile IS 'Learning profile: default, tdah, anxiety, gifted';


-- ===========================================
-- Migration 014: Guest trial tracking (server-side)
-- ===========================================

CREATE TABLE IF NOT EXISTS guest_trials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  session_count INTEGER NOT NULL DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_guest_trials_fingerprint ON guest_trials (fingerprint);

-- RLS: allow anonymous access for inserts and selects
ALTER TABLE guest_trials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous select on guest_trials" ON guest_trials;
CREATE POLICY "Allow anonymous select on guest_trials"
  ON guest_trials FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert on guest_trials" ON guest_trials;
CREATE POLICY "Allow anonymous insert on guest_trials"
  ON guest_trials FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update on guest_trials" ON guest_trials;
CREATE POLICY "Allow anonymous update on guest_trials"
  ON guest_trials FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RPC function: upsert fingerprint and increment session count, return new count
CREATE OR REPLACE FUNCTION increment_guest_trial(fingerprint_hash TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO guest_trials (fingerprint, session_count, last_session_at)
  VALUES (fingerprint_hash, 1, now())
  ON CONFLICT (fingerprint)
  DO UPDATE SET
    session_count = guest_trials.session_count + 1,
    last_session_at = now();

  SELECT session_count INTO new_count
  FROM guest_trials
  WHERE fingerprint = fingerprint_hash;

  RETURN new_count;
END;
$$;

-- RPC function: get current trial count for a fingerprint
CREATE OR REPLACE FUNCTION get_guest_trial_count(fingerprint_hash TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT session_count INTO current_count
  FROM guest_trials
  WHERE fingerprint = fingerprint_hash;

  RETURN COALESCE(current_count, 0);
END;
$$;


-- ===========================================
-- Migration 015: Teacher Classrooms (turmas, membros, materiais)
-- ===========================================

-- =============================================
-- 1. CLASSROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject VARCHAR(100),
  grade TEXT,
  code VARCHAR(7) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. CLASSROOM MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS classroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- =============================================
-- 3. CLASSROOM MATERIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS classroom_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  content_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(code);
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student ON classroom_members(student_id);
CREATE INDEX IF NOT EXISTS idx_classroom_materials_classroom ON classroom_materials(classroom_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_materials ENABLE ROW LEVEL SECURITY;

-- ----- CLASSROOMS policies -----

-- Teachers can view their own classrooms
DROP POLICY IF EXISTS "Teachers can view own classrooms" ON classrooms;
CREATE POLICY "Teachers can view own classrooms"
  ON classrooms FOR SELECT
  USING (
    teacher_id = public.get_my_profile_id()
  );

-- Teachers can create classrooms
DROP POLICY IF EXISTS "Teachers can create classrooms" ON classrooms;
CREATE POLICY "Teachers can create classrooms"
  ON classrooms FOR INSERT
  WITH CHECK (
    teacher_id = public.get_my_profile_id()
  );

-- Teachers can update their own classrooms
DROP POLICY IF EXISTS "Teachers can update own classrooms" ON classrooms;
CREATE POLICY "Teachers can update own classrooms"
  ON classrooms FOR UPDATE
  USING (
    teacher_id = public.get_my_profile_id()
  );

-- Teachers can delete their own classrooms
DROP POLICY IF EXISTS "Teachers can delete own classrooms" ON classrooms;
CREATE POLICY "Teachers can delete own classrooms"
  ON classrooms FOR DELETE
  USING (
    teacher_id = public.get_my_profile_id()
  );

-- Students can view classrooms they are members of
DROP POLICY IF EXISTS "Students can view joined classrooms" ON classrooms;
CREATE POLICY "Students can view joined classrooms"
  ON classrooms FOR SELECT
  USING (
    id IN (
      SELECT classroom_id FROM classroom_members
      WHERE student_id = public.get_my_profile_id()
    )
  );

-- ----- CLASSROOM_MEMBERS policies -----

-- Teachers can view members of their classrooms
DROP POLICY IF EXISTS "Teachers can view classroom members" ON classroom_members;
CREATE POLICY "Teachers can view classroom members"
  ON classroom_members FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

-- Teachers can remove members from their classrooms
DROP POLICY IF EXISTS "Teachers can delete classroom members" ON classroom_members;
CREATE POLICY "Teachers can delete classroom members"
  ON classroom_members FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

-- Students can view their own memberships
DROP POLICY IF EXISTS "Students can view own memberships" ON classroom_members;
CREATE POLICY "Students can view own memberships"
  ON classroom_members FOR SELECT
  USING (
    student_id = public.get_my_profile_id()
  );

-- ----- CLASSROOM_MATERIALS policies -----

-- Teachers can CRUD materials for their classrooms
DROP POLICY IF EXISTS "Teachers can view classroom materials" ON classroom_materials;
CREATE POLICY "Teachers can view classroom materials"
  ON classroom_materials FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

DROP POLICY IF EXISTS "Teachers can insert classroom materials" ON classroom_materials;
CREATE POLICY "Teachers can insert classroom materials"
  ON classroom_materials FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

DROP POLICY IF EXISTS "Teachers can update classroom materials" ON classroom_materials;
CREATE POLICY "Teachers can update classroom materials"
  ON classroom_materials FOR UPDATE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

DROP POLICY IF EXISTS "Teachers can delete classroom materials" ON classroom_materials;
CREATE POLICY "Teachers can delete classroom materials"
  ON classroom_materials FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

-- Students can view materials of classrooms they belong to
DROP POLICY IF EXISTS "Students can view joined classroom materials" ON classroom_materials;
CREATE POLICY "Students can view joined classroom materials"
  ON classroom_materials FOR SELECT
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members
      WHERE student_id = public.get_my_profile_id()
    )
  );

-- =============================================
-- RPC: Generate unique classroom code (ST-XXXX)
-- =============================================
CREATE OR REPLACE FUNCTION generate_classroom_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'ST-' || upper(substr(md5(random()::text), 1, 4));
    SELECT EXISTS(SELECT 1 FROM classrooms WHERE classrooms.code = code) INTO exists_already;
    IF NOT exists_already THEN RETURN code; END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- RPC: Join classroom by code (student calls)
-- =============================================
CREATE OR REPLACE FUNCTION join_classroom(classroom_code TEXT)
RETURNS JSON AS $$
DECLARE
  target_classroom classrooms%ROWTYPE;
  student_profile profiles%ROWTYPE;
  existing_member classroom_members%ROWTYPE;
BEGIN
  -- Find classroom by code
  SELECT * INTO target_classroom
  FROM classrooms
  WHERE code = upper(classroom_code);

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Turma nao encontrada. Codigo invalido.');
  END IF;

  -- Find the student calling this function
  SELECT * INTO student_profile
  FROM profiles
  WHERE auth_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Perfil nao encontrado');
  END IF;

  -- Check if already a member
  SELECT * INTO existing_member
  FROM classroom_members
  WHERE classroom_id = target_classroom.id AND student_id = student_profile.id;

  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Voce ja faz parte desta turma.');
  END IF;

  -- Insert membership
  INSERT INTO classroom_members (classroom_id, student_id)
  VALUES (target_classroom.id, student_profile.id);

  RETURN json_build_object('success', true, 'classroom_name', target_classroom.name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===========================================
-- Migration 016: School Leads (formulario de contato escolas)
-- ===========================================

-- =============================================
-- 1. SCHOOL_LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS school_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  student_count TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_school_leads_email ON school_leads(email);
CREATE INDEX IF NOT EXISTS idx_school_leads_created_at ON school_leads(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE school_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (landing page form — no auth required)
DROP POLICY IF EXISTS "Anyone can insert school leads" ON school_leads;
CREATE POLICY "Anyone can insert school leads"
  ON school_leads FOR INSERT
  WITH CHECK (true);

-- Only admin can view leads
DROP POLICY IF EXISTS "Admin can view school leads" ON school_leads;
CREATE POLICY "Admin can view school leads"
  ON school_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_id = auth.uid() AND email = 'carlostrindade@me.com'
    )
  );


-- ===========================================
-- Migration 017: Parent settings (daily time limit + weekly goals)
-- ===========================================

-- Daily time limit in minutes (NULL = no limit)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_time_limit_minutes INTEGER DEFAULT NULL;

-- Weekly session goal (number of sessions per week, NULL = no goal)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_session_goal INTEGER DEFAULT NULL;

-- Weekly subject focus (subject id to prioritize, NULL = any)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_subject_focus VARCHAR(50) DEFAULT NULL;


-- ===========================================
-- Migration 018: Teacher Tasks (tarefas de professor para turmas)
-- ===========================================

-- =============================================
-- 1. TEACHER TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS teacher_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. TEACHER TASK COMPLETIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS teacher_task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES teacher_tasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  session_id UUID REFERENCES sessions(id),
  UNIQUE(task_id, student_id)
);

-- =============================================
-- INDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_teacher_tasks_classroom ON teacher_tasks(classroom_id);
CREATE INDEX IF NOT EXISTS idx_teacher_tasks_teacher ON teacher_tasks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_task_completions_task ON teacher_task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_teacher_task_completions_student ON teacher_task_completions(student_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE teacher_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_task_completions ENABLE ROW LEVEL SECURITY;

-- ----- TEACHER_TASKS policies -----

-- Teachers can CRUD their own tasks
DROP POLICY IF EXISTS "Teachers manage own tasks" ON teacher_tasks;
CREATE POLICY "Teachers manage own tasks"
  ON teacher_tasks FOR ALL
  USING (teacher_id = public.get_my_profile_id());

-- Students can view tasks from their classrooms
DROP POLICY IF EXISTS "Students view classroom tasks" ON teacher_tasks;
CREATE POLICY "Students view classroom tasks"
  ON teacher_tasks FOR SELECT
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members
      WHERE student_id = public.get_my_profile_id()
    )
  );

-- ----- TEACHER_TASK_COMPLETIONS policies -----

-- Students can insert their own completions
DROP POLICY IF EXISTS "Students complete tasks" ON teacher_task_completions;
CREATE POLICY "Students complete tasks"
  ON teacher_task_completions FOR INSERT
  WITH CHECK (student_id = public.get_my_profile_id());

-- Students can view their own completions
DROP POLICY IF EXISTS "Students view own completions" ON teacher_task_completions;
CREATE POLICY "Students view own completions"
  ON teacher_task_completions FOR SELECT
  USING (student_id = public.get_my_profile_id());

-- Teachers can view all completions for their tasks
DROP POLICY IF EXISTS "Teachers view task completions" ON teacher_task_completions;
CREATE POLICY "Teachers view task completions"
  ON teacher_task_completions FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM teacher_tasks
      WHERE teacher_id = public.get_my_profile_id()
    )
  );


-- ===========================================
-- Migration 019: Username-based auth for kids
-- ===========================================

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


-- =============================================================================
-- END OF CONSOLIDATED MIGRATIONS 010-019
-- =============================================================================
