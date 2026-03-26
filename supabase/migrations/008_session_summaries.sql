-- Studdo - Session Summaries for Parent Visibility
-- Migration 008: session_summaries table + parent RPCs

-- =============================================
-- 1. SESSION SUMMARIES TABLE
-- =============================================
CREATE TABLE session_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  topics_covered TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  difficulties TEXT[] DEFAULT '{}',
  ai_suggestion TEXT,
  parent_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- =============================================
-- 2. RLS POLICIES
-- =============================================
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

-- Kids can read their own summaries
CREATE POLICY "Kids read own summaries"
  ON session_summaries FOR SELECT
  USING (kid_id = auth.uid());

-- Parents can read summaries of their linked kids
CREATE POLICY "Parents read linked kids summaries"
  ON session_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_kid_links
      WHERE parent_kid_links.parent_id = auth.uid()
        AND parent_kid_links.kid_id = session_summaries.kid_id
    )
  );

-- Authenticated users can insert their own summaries
CREATE POLICY "Insert own summaries"
  ON session_summaries FOR INSERT
  WITH CHECK (kid_id = auth.uid());

-- =============================================
-- 3. RPC: get_kid_session_summaries
-- =============================================
CREATE OR REPLACE FUNCTION get_kid_session_summaries(
  p_kid_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_subject TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  kid_id UUID,
  subject TEXT,
  duration_minutes INTEGER,
  message_count INTEGER,
  xp_earned INTEGER,
  topics_covered TEXT[],
  strengths TEXT[],
  difficulties TEXT[],
  ai_suggestion TEXT,
  parent_tip TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is a parent linked to this kid
  IF NOT EXISTS (
    SELECT 1 FROM parent_kid_links
    WHERE parent_kid_links.parent_id = auth.uid()
      AND parent_kid_links.kid_id = p_kid_id
  ) THEN
    RAISE EXCEPTION 'Access denied: not linked to this kid';
  END IF;

  RETURN QUERY
  SELECT
    ss.id,
    ss.session_id,
    ss.kid_id,
    ss.subject,
    ss.duration_minutes,
    ss.message_count,
    ss.xp_earned,
    ss.topics_covered,
    ss.strengths,
    ss.difficulties,
    ss.ai_suggestion,
    ss.parent_tip,
    ss.created_at
  FROM session_summaries ss
  WHERE ss.kid_id = p_kid_id
    AND (p_subject IS NULL OR ss.subject = p_subject)
  ORDER BY ss.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =============================================
-- 4. RPC: get_session_messages_for_parent
-- =============================================
CREATE OR REPLACE FUNCTION get_session_messages_for_parent(
  p_session_id UUID
)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is a parent linked to the kid who owns this session
  IF NOT EXISTS (
    SELECT 1 FROM sessions s
    JOIN parent_kid_links pkl ON pkl.kid_id = s.kid_id
    WHERE s.id = p_session_id
      AND pkl.parent_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: not linked to this session''s kid';
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.role::TEXT,
    m.content,
    m.created_at
  FROM messages m
  WHERE m.session_id = p_session_id
  ORDER BY m.created_at ASC;
END;
$$;

-- =============================================
-- 5. RPC: get_kid_study_stats
-- =============================================
CREATE OR REPLACE FUNCTION get_kid_study_stats(
  p_kid_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verify caller is a parent linked to this kid
  IF NOT EXISTS (
    SELECT 1 FROM parent_kid_links
    WHERE parent_kid_links.parent_id = auth.uid()
      AND parent_kid_links.kid_id = p_kid_id
  ) THEN
    RAISE EXCEPTION 'Access denied: not linked to this kid';
  END IF;

  SELECT jsonb_build_object(
    'total_sessions', (
      SELECT COUNT(*) FROM sessions WHERE kid_id = p_kid_id
    ),
    'total_minutes', (
      SELECT COALESCE(SUM(duration_minutes), 0) FROM sessions WHERE kid_id = p_kid_id
    ),
    'total_xp', (
      SELECT COALESCE(total_xp, 0) FROM user_stats WHERE user_id = p_kid_id
    ),
    'current_streak', (
      SELECT COALESCE(current_streak, 0) FROM user_stats WHERE user_id = p_kid_id
    ),
    'subjects_studied', (
      SELECT COALESCE(jsonb_agg(DISTINCT subject), '[]'::jsonb) FROM sessions WHERE kid_id = p_kid_id
    ),
    'avg_session_minutes', (
      SELECT COALESCE(ROUND(AVG(duration_minutes)), 0)
      FROM sessions
      WHERE kid_id = p_kid_id AND duration_minutes > 0
    ),
    'sessions_this_week', (
      SELECT COUNT(*) FROM sessions
      WHERE kid_id = p_kid_id
        AND created_at >= date_trunc('week', now())
    ),
    'top_difficulties', (
      SELECT COALESCE(jsonb_agg(d), '[]'::jsonb)
      FROM (
        SELECT UNNEST(difficulties) AS d, COUNT(*) AS cnt
        FROM session_summaries
        WHERE kid_id = p_kid_id
        GROUP BY d
        ORDER BY cnt DESC
        LIMIT 5
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- =============================================
-- 6. GRANT EXECUTE
-- =============================================
GRANT EXECUTE ON FUNCTION get_kid_session_summaries(UUID, INT, INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_messages_for_parent(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_kid_study_stats(UUID) TO authenticated;
