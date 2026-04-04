-- ===========================================
-- Migration 018: Teacher Tasks (tarefas de professor para turmas)
-- EXECUTAR MANUALMENTE no Supabase SQL Editor
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
CREATE INDEX idx_teacher_tasks_classroom ON teacher_tasks(classroom_id);
CREATE INDEX idx_teacher_tasks_teacher ON teacher_tasks(teacher_id);
CREATE INDEX idx_teacher_task_completions_task ON teacher_task_completions(task_id);
CREATE INDEX idx_teacher_task_completions_student ON teacher_task_completions(student_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE teacher_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_task_completions ENABLE ROW LEVEL SECURITY;

-- ----- TEACHER_TASKS policies -----

-- Teachers can CRUD their own tasks
CREATE POLICY "Teachers manage own tasks"
  ON teacher_tasks FOR ALL
  USING (teacher_id = public.get_my_profile_id());

-- Students can view tasks from their classrooms
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
CREATE POLICY "Students complete tasks"
  ON teacher_task_completions FOR INSERT
  WITH CHECK (student_id = public.get_my_profile_id());

-- Students can view their own completions
CREATE POLICY "Students view own completions"
  ON teacher_task_completions FOR SELECT
  USING (student_id = public.get_my_profile_id());

-- Teachers can view all completions for their tasks
CREATE POLICY "Teachers view task completions"
  ON teacher_task_completions FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM teacher_tasks
      WHERE teacher_id = public.get_my_profile_id()
    )
  );
