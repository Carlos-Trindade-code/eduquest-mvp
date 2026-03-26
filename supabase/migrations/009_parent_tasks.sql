-- Migration 009: Parent task suggestions for kids
-- Parents can assign specific study tasks to their linked kids

CREATE TABLE parent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE parent_tasks ENABLE ROW LEVEL SECURITY;

-- Parents: full CRUD on own tasks
CREATE POLICY "Parents manage own tasks" ON parent_tasks FOR ALL
  USING (parent_id = public.get_my_profile_id())
  WITH CHECK (parent_id = public.get_my_profile_id());

-- Kids: read tasks assigned to them
CREATE POLICY "Kids read own tasks" ON parent_tasks FOR SELECT
  USING (kid_id = public.get_my_profile_id());

-- Kids: update status of own tasks (mark in_progress/completed)
CREATE POLICY "Kids update own task status" ON parent_tasks FOR UPDATE
  USING (kid_id = public.get_my_profile_id())
  WITH CHECK (kid_id = public.get_my_profile_id());
