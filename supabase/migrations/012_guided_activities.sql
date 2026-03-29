-- ===========================================
-- Migration 012: Guided Activities (Estudar Juntos)
-- EXECUTAR MANUALMENTE no Supabase SQL Editor
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
CREATE INDEX idx_guided_activities_parent ON guided_activities(parent_id);
CREATE INDEX idx_guided_activities_kid ON guided_activities(kid_id);
CREATE INDEX idx_guided_activities_status ON guided_activities(status);

-- Habilitar RLS
ALTER TABLE guided_activities ENABLE ROW LEVEL SECURITY;

-- Pais podem fazer CRUD nas proprias atividades
CREATE POLICY "Parents manage own activities"
ON guided_activities FOR ALL
USING (parent_id = public.get_my_profile_id());

-- Kids podem ver atividades atribuidas a eles
CREATE POLICY "Kids view own activities"
ON guided_activities FOR SELECT
USING (kid_id = public.get_my_profile_id());

-- Kids podem atualizar status das suas atividades
CREATE POLICY "Kids update own activity status"
ON guided_activities FOR UPDATE
USING (kid_id = public.get_my_profile_id())
WITH CHECK (kid_id = public.get_my_profile_id());
