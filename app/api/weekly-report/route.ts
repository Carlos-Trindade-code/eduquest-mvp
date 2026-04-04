import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildWeeklyReportHtml } from '@/lib/email/weekly-report';
import { subjects } from '@/lib/subjects/config';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.WEEKLY_REPORT_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Studdo <noreply@studdo.com.br>';

  // Get all parents
  const { data: parents } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('user_type', 'parent');

  if (!parents?.length) {
    return Response.json({ sent: 0, errors: 0, message: 'No parents found' });
  }

  let sent = 0;
  let errors = 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  for (const parent of parents) {
    try {
      // Get linked kids
      const { data: links } = await supabase
        .from('parent_kid_links')
        .select('kid_id')
        .eq('parent_id', parent.id);

      if (!links?.length) continue;

      for (const link of links) {
        // Get kid profile
        const { data: kid } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', link.kid_id)
          .single();

        if (!kid) continue;

        // Get sessions this week
        const { data: sessions } = await supabase
          .from('sessions')
          .select('subject, started_at, ended_at, xp_earned')
          .eq('kid_id', kid.id)
          .gte('started_at', sevenDaysAgo);

        // Get current streak
        const { data: stats } = await supabase
          .from('user_stats')
          .select('current_streak')
          .eq('user_id', kid.id)
          .single();

        // Calculate stats
        let totalMinutes = 0;
        let totalXp = 0;
        const subjectCounts: Record<string, number> = {};

        for (const s of sessions || []) {
          if (s.ended_at && s.started_at) {
            totalMinutes += Math.round(
              (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000
            );
          }
          totalXp += s.xp_earned || 0;
          subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
        }

        const topSubjects = Object.entries(subjectCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id, count]) => {
            const sub = subjects.find((s) => s.id === id);
            return { name: sub?.name || id, icon: sub?.icon || '📚', count };
          });

        const html = buildWeeklyReportHtml(
          parent.name?.split(' ')[0] || 'Pai/Mãe',
          kid.name?.split(' ')[0] || 'Seu filho',
          {
            sessionsThisWeek: sessions?.length || 0,
            minutesStudied: totalMinutes,
            xpEarned: totalXp,
            currentStreak: stats?.current_streak || 0,
            topSubjects,
          },
        );

        await resend.emails.send({
          from: fromEmail,
          to: parent.email,
          subject: `📊 Relatório semanal de ${kid.name?.split(' ')[0] || 'seu filho'} — Studdo`,
          html,
        });

        sent++;
      }
    } catch (err) {
      console.error(`Failed to send report to ${parent.email}:`, err);
      errors++;
    }
  }

  return Response.json({ sent, errors });
}
