-- ===========================================
-- Migration 015: Teacher Classrooms (turmas, membros, materiais)
-- EXECUTAR MANUALMENTE no Supabase SQL Editor
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
CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_classrooms_code ON classrooms(code);
CREATE INDEX idx_classroom_members_classroom ON classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_student ON classroom_members(student_id);
CREATE INDEX idx_classroom_materials_classroom ON classroom_materials(classroom_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_materials ENABLE ROW LEVEL SECURITY;

-- ----- CLASSROOMS policies -----

-- Teachers can view their own classrooms
CREATE POLICY "Teachers can view own classrooms"
  ON classrooms FOR SELECT
  USING (
    teacher_id = public.get_my_profile_id()
  );

-- Teachers can create classrooms
CREATE POLICY "Teachers can create classrooms"
  ON classrooms FOR INSERT
  WITH CHECK (
    teacher_id = public.get_my_profile_id()
  );

-- Teachers can update their own classrooms
CREATE POLICY "Teachers can update own classrooms"
  ON classrooms FOR UPDATE
  USING (
    teacher_id = public.get_my_profile_id()
  );

-- Teachers can delete their own classrooms
CREATE POLICY "Teachers can delete own classrooms"
  ON classrooms FOR DELETE
  USING (
    teacher_id = public.get_my_profile_id()
  );

-- Students can view classrooms they are members of
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
CREATE POLICY "Teachers can view classroom members"
  ON classroom_members FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

-- Teachers can remove members from their classrooms
CREATE POLICY "Teachers can delete classroom members"
  ON classroom_members FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

-- Students can view their own memberships
CREATE POLICY "Students can view own memberships"
  ON classroom_members FOR SELECT
  USING (
    student_id = public.get_my_profile_id()
  );

-- ----- CLASSROOM_MATERIALS policies -----

-- Teachers can CRUD materials for their classrooms
CREATE POLICY "Teachers can view classroom materials"
  ON classroom_materials FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

CREATE POLICY "Teachers can insert classroom materials"
  ON classroom_materials FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

CREATE POLICY "Teachers can update classroom materials"
  ON classroom_materials FOR UPDATE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

CREATE POLICY "Teachers can delete classroom materials"
  ON classroom_materials FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE teacher_id = public.get_my_profile_id()
    )
  );

-- Students can view materials of classrooms they belong to
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
