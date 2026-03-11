-- EduQuest - Initial Database Schema
-- Execute this in Supabase SQL Editor (supabase.com > SQL Editor)

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('parent', 'kid')),
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  language VARCHAR(10) DEFAULT 'pt-BR',
  age INTEGER CHECK (age >= 4 AND age <= 18),
  grade VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. PARENT-KID LINKS
-- =============================================
CREATE TABLE parent_kid_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, kid_id)
);

-- =============================================
-- 3. STUDY SESSIONS
-- =============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL DEFAULT 'other',
  homework_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  xp_earned INTEGER DEFAULT 0
);

-- =============================================
-- 4. CHAT MESSAGES
-- =============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 5. USER STATS (gamification)
-- =============================================
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  sessions_completed INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 6. BADGES
-- =============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- =============================================
-- 7. STUDY GOALS
-- =============================================
CREATE TABLE study_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('sessions_per_week', 'xp_target', 'time_per_day')),
  target_value INTEGER NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_kid_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth_id = auth.uid());

-- PROFILES: Parents can view their kids' profiles
CREATE POLICY "Parents can view kids profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      )
    )
  );

-- PARENT_KID_LINKS: Parents can manage their links
CREATE POLICY "Parents can view own links"
  ON parent_kid_links FOR SELECT
  USING (
    parent_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Parents can create links"
  ON parent_kid_links FOR INSERT
  WITH CHECK (
    parent_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

-- SESSIONS: Kids can manage their own sessions
CREATE POLICY "Kids can view own sessions"
  ON sessions FOR SELECT
  USING (
    kid_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Kids can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    kid_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Kids can update own sessions"
  ON sessions FOR UPDATE
  USING (
    kid_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

-- SESSIONS: Parents can view their kids' sessions
CREATE POLICY "Parents can view kids sessions"
  ON sessions FOR SELECT
  USING (
    kid_id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = (
        SELECT id FROM profiles WHERE auth_id = auth.uid()
      )
    )
  );

-- MESSAGES: Users can view messages from their sessions
CREATE POLICY "Users can view own session messages"
  ON messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM sessions
      WHERE kid_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM sessions
      WHERE kid_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
    )
  );

-- Parents can view kids' messages
CREATE POLICY "Parents can view kids messages"
  ON messages FOR SELECT
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN parent_kid_links pkl ON pkl.kid_id = s.kid_id
      WHERE pkl.parent_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
    )
  );

-- USER_STATS: Users can view/update own stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (
    user_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (
    user_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

-- Parents can view kids' stats
CREATE POLICY "Parents can view kids stats"
  ON user_stats FOR SELECT
  USING (
    user_id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
    )
  );

-- BADGES: Users can view own, parents can view kids'
CREATE POLICY "Users can view own badges"
  ON badges FOR SELECT
  USING (
    user_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can earn badges"
  ON badges FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Parents can view kids badges"
  ON badges FOR SELECT
  USING (
    user_id IN (
      SELECT kid_id FROM parent_kid_links
      WHERE parent_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
    )
  );

-- STUDY_GOALS: Parents manage, kids can view
CREATE POLICY "Parents can manage goals"
  ON study_goals FOR ALL
  USING (
    parent_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Kids can view own goals"
  ON study_goals FOR SELECT
  USING (
    kid_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
  );

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, name, email, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'user_type', 'kid')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Auto-create user_stats on profile creation
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- =============================================
-- INDEX for performance
-- =============================================
CREATE INDEX idx_sessions_kid_id ON sessions(kid_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_parent_kid_links_parent ON parent_kid_links(parent_id);
CREATE INDEX idx_parent_kid_links_kid ON parent_kid_links(kid_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
