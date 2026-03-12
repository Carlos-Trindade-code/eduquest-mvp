-- ============================================================
-- Migration 003: Suggestions table + Admin RPCs
-- ============================================================

-- 1. Tabela de sugestoes
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

-- RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert suggestions" ON suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own suggestions" ON suggestions FOR SELECT USING (auth.uid() = user_id);

-- 2. RPC: metricas globais para admin
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM profiles),
    'total_kids', (SELECT count(*) FROM profiles WHERE user_type = 'kid'),
    'total_parents', (SELECT count(*) FROM profiles WHERE user_type = 'parent'),
    'total_sessions', (SELECT count(*) FROM tutor_sessions),
    'active_today', (SELECT count(DISTINCT kid_id) FROM tutor_sessions WHERE started_at >= CURRENT_DATE),
    'total_suggestions', (SELECT count(*) FROM suggestions),
    'pending_suggestions', (SELECT count(*) FROM suggestions WHERE status = 'pending')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: listar todas sugestoes (admin)
CREATE OR REPLACE FUNCTION get_all_suggestions()
RETURNS SETOF suggestions AS $$
BEGIN
  RETURN QUERY SELECT * FROM suggestions ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: atualizar status de sugestao (admin)
CREATE OR REPLACE FUNCTION update_suggestion_status(
  suggestion_id UUID,
  new_status TEXT,
  notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE suggestions SET status = new_status, admin_notes = COALESCE(notes, admin_notes)
  WHERE id = suggestion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
