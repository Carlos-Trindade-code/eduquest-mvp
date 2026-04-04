interface WeeklyStats {
  sessionsThisWeek: number;
  minutesStudied: number;
  xpEarned: number;
  currentStreak: number;
  topSubjects: { name: string; icon: string; count: number }[];
}

export function buildWeeklyReportHtml(parentName: string, kidName: string, stats: WeeklyStats): string {
  const subjectsHtml = stats.topSubjects.length > 0
    ? stats.topSubjects.map(s =>
        `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;margin-bottom:6px;">
          <span style="font-size:18px;">${s.icon}</span>
          <span style="color:rgba(255,255,255,0.7);font-size:14px;flex:1;">${s.name}</span>
          <span style="color:rgba(245,166,35,0.9);font-size:13px;font-weight:600;">${s.count} sessões</span>
        </div>`
      ).join('')
    : '<p style="color:rgba(255,255,255,0.4);font-size:13px;">Nenhuma sessão esta semana</p>';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#1E1046;color:white;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;">🦉</span>
        <h1 style="font-size:20px;margin:8px 0 4px;">Relatório Semanal</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Resumo de ${kidName} nos últimos 7 dias</p>
      </div>

      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:20px;">
        Olá, ${parentName}! Veja como ${kidName} se saiu esta semana:
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:bold;color:#F5A623;">${stats.sessionsThisWeek}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px;">Sessões</div>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:bold;color:#3B82F6;">${stats.minutesStudied}min</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px;">Estudados</div>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:bold;color:#8B5CF6;">${stats.xpEarned}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px;">XP ganho</div>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:bold;color:#F97316;">${stats.currentStreak} 🔥</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px;">Streak</div>
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <h3 style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:8px;font-weight:600;">Matérias estudadas</h3>
        ${subjectsHtml}
      </div>

      <div style="text-align:center;margin:28px 0 20px;">
        <a href="https://www.studdo.com.br/parent/dashboard" style="display:inline-block;background:#F5A623;color:#0D1B2A;padding:14px 32px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:14px;">
          Ver dashboard completo
        </a>
      </div>

      <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:20px;">
        Studdo — Tutor IA que ensina de verdade
      </p>
    </div>
  `;
}
