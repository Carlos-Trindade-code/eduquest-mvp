import type { AlertSeverity, ParentAlert } from '@/lib/auth/types';

/**
 * Parent Alert System
 *
 * REGRA FUNDAMENTAL: Todo alerta DEVE vir com instrução de ação.
 * Alerta sem orientação gera ansiedade, não ajuda.
 */

export interface AlertDefinition {
  type: string;
  title: string;
  severity: AlertSeverity;
  description: string;
  recommended_action: string;
  condition: (stats: SessionAnalytics) => boolean;
}

export interface SessionAnalytics {
  avgTimePerQuestion: number; // in seconds
  globalAvgTimePerQuestion: number;
  consecutiveErrorsSameConept: number;
  idleTimePercentage: number; // 0-1
  previouslyMasteredTopicErrors: boolean;
  explorerModeActive: boolean;
  sessionAbandonedEarly: boolean;
  currentStreak: number;
  sessionsThisWeek: number;
  totalSessionsCompleted: number;
  subjectErrors: Record<string, number>;
}

export const alertDefinitions: AlertDefinition[] = [
  // ⏱️ Time above average on question
  {
    type: 'slow_question_time',
    title: 'Tempo acima da média em questão',
    severity: 'info',
    description:
      'Seu filho está demorando mais que o normal em uma questão — isso pode indicar uma dificuldade real no conceito, não preguiça.',
    recommended_action:
      'Sente junto com seu filho e peça que explique o enunciado com as próprias palavras. Muitas vezes a dificuldade está em entender o que a pergunta pede, não no conteúdo.',
    condition: (s) =>
      s.avgTimePerQuestion > s.globalAvgTimePerQuestion * 2,
  },

  // 🔁 Same error repeated across sessions
  {
    type: 'recurring_error',
    title: 'Mesmo erro em sessões diferentes',
    severity: 'warning',
    description:
      'Seu filho está repetindo o mesmo tipo de erro — isso indica um gap de aprendizado estrutural, onde um conceito anterior não foi consolidado.',
    recommended_action:
      'Converse com o professor sobre essa dificuldade específica. Em casa, reserve 10 minutos por dia para revisar esse conceito com o Studdo no modo "Revisão Focada".',
    condition: (s) =>
      s.consecutiveErrorsSameConept >= 3,
  },

  // 😶 High dispersion / idle time
  {
    type: 'high_dispersion',
    title: 'Dispersão detectada durante estudo',
    severity: 'attention',
    description:
      'Foram detectadas pausas longas e tempo ocioso — pode ser fadiga, ansiedade, fome, falta de sono ou TDAH.',
    recommended_action:
      'Verifique o horário de estudo do seu filho (está cansado? com fome?). Se esse padrão se repetir, considere agendar uma consulta com psicopedagogo para investigar.',
    condition: (s) =>
      s.idleTimePercentage > 0.4,
  },

  // 📉 Sudden drop in mastered topic
  {
    type: 'mastery_drop',
    title: 'Queda em tema anteriormente dominado',
    severity: 'attention',
    description:
      'Seu filho está errando em um assunto que já dominava — isso geralmente indica um fator externo interferindo (emocional, conflito escolar, falta de sono).',
    recommended_action:
      'Priorize uma conversa emocional ANTES da acadêmica. Pergunte como estão as coisas na escola e com os amigos. O desempenho acadêmico muitas vezes reflete o estado emocional.',
    condition: (s) =>
      s.previouslyMasteredTopicErrors,
  },

  // 🚀 Explorer mode activated
  {
    type: 'explorer_mode',
    title: 'Aluno avançou além do currículo!',
    severity: 'positive',
    description:
      'Seu filho demonstrou interesse genuíno e capacidade acima da média em um tema, ativando o Modo Explorer para ir além do conteúdo da série.',
    recommended_action:
      'Valorize esse momento! Pesquise cursos, clubes de ciência, olimpíadas escolares ou atividades extracurriculares na área de interesse. Esse tipo de curiosidade é raro e precioso.',
    condition: (s) =>
      s.explorerModeActive,
  },

  // ❌ Session abandoned
  {
    type: 'session_abandoned',
    title: 'Sessão abandonada antes de completar',
    severity: 'info',
    description:
      'Seu filho saiu da sessão de estudo antes de terminar — pode ser cansaço, dificuldade elevada ou desmotivação pontual.',
    recommended_action:
      'Não force a retomada imediata. Pergunte com gentileza o que foi difícil. Às vezes uma pausa e um lanche resolvem. Se repetir frequentemente, ajuste o horário de estudo.',
    condition: (s) =>
      s.sessionAbandonedEarly,
  },

  // 🎉 Great streak
  {
    type: 'great_streak',
    title: 'Sequência incrível de estudo!',
    severity: 'positive',
    description:
      `Seu filho está estudando consistentemente — essa regularidade é o maior preditor de sucesso acadêmico.`,
    recommended_action:
      'Celebre esse esforço! Uma recompensa simbólica ou elogio específico ("estou orgulhoso da sua disciplina") reforça o hábito.',
    condition: (s) =>
      s.currentStreak >= 7,
  },

  // 📊 Low engagement this week
  {
    type: 'low_engagement',
    title: 'Poucas sessões esta semana',
    severity: 'info',
    description:
      'Seu filho estudou menos que o habitual esta semana.',
    recommended_action:
      'Convide para uma sessão rápida de 10 minutos — sem pressão. Sessões curtas são melhores que nenhuma. Pergunte se há algo desmotivando.',
    condition: (s) =>
      s.sessionsThisWeek < 2 && s.totalSessionsCompleted > 5,
  },
];

export function checkAlerts(analytics: SessionAnalytics): Omit<ParentAlert, 'id' | 'kid_id' | 'read' | 'created_at'>[] {
  return alertDefinitions
    .filter((def) => def.condition(analytics))
    .map((def) => ({
      type: def.type,
      severity: def.severity,
      title: def.title,
      description: def.description,
      recommended_action: def.recommended_action,
    }));
}
