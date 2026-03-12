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
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { getAdminMetrics, getAllSuggestions, getAllProfiles, updateSuggestionStatus } from '@/lib/supabase/queries';
import { SuggestionsList } from './SuggestionsList';
import { UsersTable } from './UsersTable';
import { MetricsCards } from './MetricsCards';
import type { AdminMetrics, Suggestion, Profile } from '@/lib/auth/types';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const supabase = createSupabase();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [metricsData, suggestionsData, profilesData] = await Promise.all([
        getAdminMetrics(supabase),
        getAllSuggestions(supabase),
        getAllProfiles(supabase),
      ]);
      setMetrics(metricsData);
      setSuggestions(suggestionsData);
      setProfiles(profilesData);
      setLoading(false);
    }
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
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Clock size={12} />
              {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </Tabs.List>

          {/* Overview tab */}
          <Tabs.Content value="overview">
            <MetricsCards metrics={metrics} />
          </Tabs.Content>

          {/* Suggestions tab */}
          <Tabs.Content value="suggestions">
            <SuggestionsList
              suggestions={suggestions}
              onUpdateStatus={handleUpdateSuggestion}
            />
          </Tabs.Content>

          {/* Users tab */}
          <Tabs.Content value="users">
            <UsersTable profiles={profiles} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
