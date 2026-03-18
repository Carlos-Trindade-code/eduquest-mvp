-- supabase/migrations/004_user_feedback.sql

-- Tabela de feedback dos usuários
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(auth_id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  source text NOT NULL CHECK (source IN ('floating_button', 'post_session')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode inserir o próprio feedback
CREATE POLICY "Users can insert own feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ninguém pode ler diretamente (somente via RPC admin)
CREATE POLICY "No direct select"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (false);

-- RPC: enviar feedback (usuário logado)
CREATE OR REPLACE FUNCTION submit_feedback(
  p_rating int,
  p_comment text DEFAULT NULL,
  p_source text DEFAULT 'floating_button'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_feedback (user_id, rating, comment, source)
  VALUES (auth.uid(), p_rating, p_comment, p_source);
END;
$$;

-- RPC: listar todos os feedbacks (admin only — checar email no app)
CREATE OR REPLACE FUNCTION get_all_feedback()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  rating int,
  comment text,
  source text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.user_id,
    p.name AS user_name,
    p.email AS user_email,
    f.rating,
    f.comment,
    f.source,
    f.created_at
  FROM user_feedback f
  LEFT JOIN profiles p ON p.auth_id = f.user_id
  ORDER BY f.created_at DESC;
END;
$$;

-- RPC: stats de feedback (admin)
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'avg_rating', ROUND(AVG(rating)::numeric, 1),
    'new_today', COUNT(*) FILTER (WHERE created_at >= now() - interval '24 hours'),
    'by_source', jsonb_build_object(
      'floating_button', COUNT(*) FILTER (WHERE source = 'floating_button'),
      'post_session', COUNT(*) FILTER (WHERE source = 'post_session')
    )
  )
  INTO result
  FROM user_feedback;
  RETURN result;
END;
$$;
