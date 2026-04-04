import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { subjects } from '@/lib/subjects/config';

export async function GET(request: NextRequest) {
  const classroomId = request.nextUrl.searchParams.get('classroomId');
  if (!classroomId) {
    return new Response('classroomId obrigatório', { status: 400 });
  }

  const supabase = createRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Não autenticado', { status: 401 });

  // Verify teacher owns classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name, subject, code')
    .eq('id', classroomId)
    .single();

  if (!classroom) return new Response('Turma não encontrada', { status: 404 });

  // Get members
  const { data: members } = await supabase
    .from('classroom_members')
    .select('student_id')
    .eq('classroom_id', classroomId);

  const studentIds = (members || []).map((m) => m.student_id);

  // Get student profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', studentIds.length > 0 ? studentIds : ['none']);

  // Get all sessions for these students
  const { data: sessions } = await supabase
    .from('sessions')
    .select('kid_id, subject, started_at, ended_at, xp_earned')
    .in('kid_id', studentIds.length > 0 ? studentIds : ['none']);

  // Build per-student stats
  const studentStats = (profiles || []).map((p) => {
    const studentSessions = (sessions || []).filter((s) => s.kid_id === p.id);
    let totalMinutes = 0;
    let totalXp = 0;
    const subjectCounts: Record<string, number> = {};
    let lastSession: string | null = null;

    for (const s of studentSessions) {
      if (s.ended_at && s.started_at) {
        totalMinutes += Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000);
      }
      totalXp += s.xp_earned || 0;
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      if (!lastSession || s.started_at > lastSession) lastSession = s.started_at;
    }

    const favSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0];
    const favInfo = favSubject ? subjects.find((s) => s.id === favSubject[0]) : null;

    return {
      name: p.name || 'Sem nome',
      sessions: studentSessions.length,
      minutes: totalMinutes,
      xp: totalXp,
      lastActivity: lastSession ? new Date(lastSession).toLocaleDateString('pt-BR') : '—',
      favoriteSubject: favInfo ? `${favInfo.icon} ${favInfo.name}` : '—',
    };
  }).sort((a, b) => b.xp - a.xp);

  const totalSessions = studentStats.reduce((s, st) => s + st.sessions, 0);
  const totalMinutes = studentStats.reduce((s, st) => s + st.minutes, 0);
  const avgXp = studentStats.length > 0 ? Math.round(studentStats.reduce((s, st) => s + st.xp, 0) / studentStats.length) : 0;
  const subjectInfo = subjects.find((s) => s.id === classroom.subject);
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const rows = studentStats.map((st, i) => `
    <tr style="${i % 2 === 0 ? 'background:#f9f9f9;' : ''}">
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${st.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${st.sessions}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${st.minutes}min</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${st.xp}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${st.lastActivity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${st.favoriteSubject}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório — ${classroom.name}</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1a1a1a; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { flex: 1; padding: 12px; background: #f4f4f5; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #7c3aed; }
    .stat-label { font-size: 11px; color: #888; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #7c3aed; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
    th:not(:first-child) { text-align: center; }
    .footer { margin-top: 32px; text-align: center; color: #aaa; font-size: 11px; }
    @media print { body { padding: 16px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;justify-content:between;margin-bottom:8px;">
    <div>
      <h1>📊 ${classroom.name}</h1>
      <p class="meta">${subjectInfo ? `${subjectInfo.icon} ${subjectInfo.name}` : ''} · Código: ${classroom.code} · Gerado em ${today}</p>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-value">${studentStats.length}</div><div class="stat-label">Alunos</div></div>
    <div class="stat"><div class="stat-value">${totalSessions}</div><div class="stat-label">Sessões</div></div>
    <div class="stat"><div class="stat-value">${totalMinutes}min</div><div class="stat-label">Tempo total</div></div>
    <div class="stat"><div class="stat-value">${avgXp}</div><div class="stat-label">XP médio</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Aluno</th>
        <th>Sessões</th>
        <th>Tempo</th>
        <th>XP</th>
        <th>Última atividade</th>
        <th>Matéria favorita</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6" style="padding:16px;text-align:center;color:#999;">Nenhum aluno na turma</td></tr>'}
    </tbody>
  </table>

  <p class="footer">Studdo — Tutor IA que ensina de verdade · www.studdo.com.br</p>
  <p class="no-print" style="text-align:center;margin-top:16px;">
    <button onclick="window.print()" style="background:#7c3aed;color:white;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:600;">
      Imprimir / Salvar PDF
    </button>
  </p>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
