export type UserType = 'parent' | 'kid' | 'admin';

export interface Suggestion {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  content: string;
  status: 'pending' | 'read' | 'done';
  admin_notes: string | null;
  created_at: string;
}

export interface AdminMetrics {
  total_users: number;
  total_kids: number;
  total_parents: number;
  total_sessions: number;
  active_today: number;
  total_suggestions: number;
  pending_suggestions: number;
}

export type AgeGroup = '4-6' | '7-9' | '10-12' | '13-15' | '16-18';

export type BehavioralProfile = 'default' | 'tdah' | 'anxiety' | 'gifted';

export interface Profile {
  id: string;
  auth_id: string;
  user_type: UserType;
  name: string;
  email: string;
  avatar_url: string | null;
  language: string;
  age: number | null;
  grade: string | null;
  age_group: AgeGroup;
  behavioral_profile: BehavioralProfile;
  invite_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentKidLink {
  id: string;
  parent_id: string;
  kid_id: string;
  created_at: string;
}

export interface Session {
  id: string;
  kid_id: string;
  subject: string;
  homework_text: string;
  created_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  xp_earned: number;
  error_count: number;
  message_count: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  sessions_completed: number;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export interface StudyGoal {
  id: string;
  parent_id: string;
  kid_id: string;
  goal_type: 'sessions_per_week' | 'xp_target' | 'time_per_day';
  target_value: number;
  period: 'weekly' | 'monthly';
  created_at: string;
}

// Chat types (used in frontend)
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Spaced Repetition
export interface ReviewCard {
  id: string;
  user_id: string;
  subject: string;
  concept: string;
  question: string;
  difficulty: number;
  next_review: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  created_at: string;
}

// Parent Alerts
export type AlertSeverity = 'info' | 'warning' | 'attention' | 'positive';

export interface ParentAlert {
  id: string;
  kid_id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommended_action: string;
  read: boolean;
  created_at: string;
}

// Recommended Activities
export interface RecommendedActivity {
  id: string;
  subject: string;
  activity: string;
  benefit: string;
  age_groups: AgeGroup[];
  difficulty_trigger?: string;
}
