'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Users,
  GraduationCap,
  UserCheck,
  Activity,
  Lightbulb,
  Clock,
  BarChart3,
  Shield,
  MessageSquare,
  School,
  ArrowLeft,
  LogOut,
  RefreshCw,
  Download,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { getAdminMetrics, getAllSuggestions, getAllProfiles, updateSuggestionStatus, getAllFeedback, getFeedbackStats } from '@/lib/supabase/queries';
import { SuggestionsList } from './SuggestionsList';
import { UsersTable } from './UsersTable';
import { MetricsCards } from './MetricsCards';
import { FeedbackList } from './FeedbackList';
import { AnalyticsPanel } from './AnalyticsPanel';
import type { AdminMetrics, Suggestion, Profile, UserFeedback, FeedbackStats } from '@/lib/auth/types';
import { exportToCSV } from '@/lib/export/csv';

function createSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schoolLeads, setSchoolLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const supabase = createSupabase();

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [metricsData, suggestionsData, profilesData, feedbacksData, feedbackStatsData] = await Promise.all([
        getAdminMetrics(supabase),
        getAllSuggestions(supabase),
        getAllProfiles(supabase),
        getAllFeedback(supabase),
        getFeedbackStats(supabase),
      ]);
      setMetrics(metricsData);
      setSuggestions(suggestionsData);
      setProfiles(profilesData);
      setFeedbacks(feedbacksData);
      setFeedbackStats(feedbackStatsData);
      supabase.rpc('get_school_leads').then(({ data }) => setSchoolLeads(data || []));
      setError(null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateSuggestion = async (id: string, status: 'pending' | 'read' | 'done', notes?: string) => {
    await updateSuggestionStatus(supabase, id, status, notes);
    // Refresh suggestions
    const updated = await getAllSuggestions(supabase);
    setSuggestions(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabTriggerClass = (value: string) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
      activeTab === value
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
        : 'text-white/50 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="min-h-screen bg-gradient-app">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Studdo Admin</h1>
                <p className="text-white/40 text-xs">Painel de controle</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
              <span className="text-white/30 text-xs flex items-center gap-1">
                <Clock size={12} />
                {new Date().toLocaleDateString('pt-BR')}
              </span>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors"
              >
                <ArrowLeft size={14} />
                Voltar
              </button>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => { setError(null); loadData(); }} className="text-red-400 text-xs font-bold hover:text-red-300 transition-colors shrink-0 ml-4">
              Tentar novamente
            </button>
          </div>
        )}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab triggers */}
          <Tabs.List className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Tabs.Trigger value="overview" className={tabTriggerClass('overview')}>
              <span className="flex items-center gap-2">
                <BarChart3 size={16} />
                Visao Geral
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="suggestions" className={tabTriggerClass('suggestions')}>
              <span className="flex items-center gap-2">
                <Lightbulb size={16} />
                Sugestoes
                {metrics?.pending_suggestions ? (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-gray-900 text-xs font-bold">
                    {metrics.pending_suggestions}
                  </span>
                ) : null}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="users" className={tabTriggerClass('users')}>
              <span className="flex items-center gap-2">
                <Users size={16} />
                Usuarios
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="feedback" className={tabTriggerClass('feedback')}>
              <span className="flex items-center gap-2">
                <MessageSquare size={16} />
                Feedback
                {(feedbackStats?.new_today ?? 0) > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {feedbackStats!.new_today}
                  </span>
                )}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="analytics" className={tabTriggerClass('analytics')}>
              <span className="flex items-center gap-2">
                <Activity size={16} />
                Analytics
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger value="schools" className={tabTriggerClass('schools')}>
              <span className="flex items-center gap-2">
                <School size={16} />
                Escolas
                {schoolLeads.length > 0 && (
                  <span className="bg-purple-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {schoolLeads.length}
                  </span>
                )}
              </span>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Overview tab */}
          <Tabs.Content value="overview">
            <MetricsCards metrics={metrics} />
          </Tabs.Content>

          {/* Suggestions tab */}
          <Tabs.Content value="suggestions">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => exportToCSV(
                  suggestions.map(s => ({
                    Conteudo: s.content,
                    Nome: s.user_name || '',
                    Email: s.user_email || '',
                    Status: s.status,
                    Notas: s.admin_notes || '',
                    Data: new Date(s.created_at).toLocaleDateString('pt-BR'),
                  })),
                  'sugestoes'
                )}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors"
              >
                <Download size={14} />
                Exportar CSV
              </button>
            </div>
            <SuggestionsList
              suggestions={suggestions}
              onUpdateStatus={handleUpdateSuggestion}
            />
          </Tabs.Content>

          {/* Users tab */}
          <Tabs.Content value="users">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => exportToCSV(
                  profiles.map(p => ({
                    Nome: p.name || 'Sem nome',
                    Email: p.email,
                    Tipo: p.user_type,
                    Criado_em: new Date(p.created_at).toLocaleDateString('pt-BR'),
                  })),
                  'usuarios'
                )}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors"
              >
                <Download size={14} />
                Exportar CSV
              </button>
            </div>
            <UsersTable profiles={profiles} loading={loading} />
          </Tabs.Content>

          {/* Feedback tab */}
          <Tabs.Content value="feedback">
            <FeedbackList feedbacks={feedbacks} stats={feedbackStats} />
          </Tabs.Content>

          {/* Analytics tab */}
          <Tabs.Content value="analytics">
            <AnalyticsPanel />
          </Tabs.Content>

          {/* School leads tab */}
          <Tabs.Content value="schools">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <School size={20} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Leads de Escolas</h2>
                  <p className="text-white/40 text-xs">{schoolLeads.length} contato{schoolLeads.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {schoolLeads.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-10">Nenhum contato de escola ainda</p>
              ) : (
                <div className="space-y-3">
                  {schoolLeads.map((lead) => (
                    <div key={lead.id} className="glass rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold text-sm">{lead.school_name}</h3>
                          <p className="text-white/50 text-xs">{lead.contact_name} · {lead.role}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: lead.status === 'new' ? 'rgba(245,166,35,0.1)' : lead.status === 'contacted' ? 'rgba(59,130,246,0.1)' : lead.status === 'closed' ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.1)',
                          color: lead.status === 'new' ? '#F5A623' : lead.status === 'contacted' ? '#3B82F6' : lead.status === 'closed' ? 'rgba(255,255,255,0.3)' : '#10B981',
                          border: `1px solid ${lead.status === 'new' ? 'rgba(245,166,35,0.2)' : lead.status === 'contacted' ? 'rgba(59,130,246,0.2)' : lead.status === 'closed' ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.2)'}`,
                        }}>
                          {lead.status === 'new' ? 'Novo' : lead.status === 'contacted' ? 'Contactado' : lead.status === 'closed' ? 'Fechado' : lead.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-white/40">
                        <span>{lead.email}</span>
                        {lead.phone && <span>{lead.phone}</span>}
                        {lead.student_count && <span>{lead.student_count} alunos</span>}
                      </div>
                      {lead.message && (
                        <p className="text-white/50 text-xs mt-2 italic">&ldquo;{lead.message}&rdquo;</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                        <p className="text-white/20 text-xs">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex gap-2">
                          {lead.status === 'new' && (
                            <button
                              onClick={async () => {
                                await supabase.from('school_leads').update({ status: 'contacted' }).eq('id', lead.id);
                                setSchoolLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: 'contacted' } : l));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                            >
                              Contactado
                            </button>
                          )}
                          {lead.status !== 'closed' && (
                            <button
                              onClick={async () => {
                                await supabase.from('school_leads').update({ status: 'closed' }).eq('id', lead.id);
                                setSchoolLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: 'closed' } : l));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 text-white/40 text-xs font-medium hover:bg-white/10 transition-colors"
                            >
                              Fechar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
