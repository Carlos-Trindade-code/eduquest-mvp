import { createClient } from '@/lib/supabase/client';

type EventType =
  | 'page_view'
  | 'session_started'
  | 'session_ended'
  | 'message_sent'
  | 'invite_code_redeemed'
  | 'feedback_submitted'
  | 'onboarding_completed'
  | 'login'
  | 'register'
  | 'quiz_completed'
  | 'material_uploaded'
  | 'exam_generated'
  | 'account_deleted';

export function trackEvent(eventType: EventType, metadata?: Record<string, unknown>) {
  try {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      supabase
        .from('analytics_events')
        .insert({
          user_id: data.user?.id ?? null,
          event_type: eventType,
          metadata: metadata ?? {},
        })
        .then(() => {});
    });
  } catch {
    // analytics is non-critical — never block the user
  }
}
