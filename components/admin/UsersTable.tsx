'use client';

import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCheck, Shield, BookOpen } from 'lucide-react';
import type { Profile } from '@/lib/auth/types';

interface UsersTableProps {
  profiles: Profile[];
}

const typeConfig: Record<string, { label: string; icon: typeof GraduationCap; color: string }> = {
  kid: { label: 'Aluno', icon: GraduationCap, color: '#3B82F6' },
  parent: { label: 'Pai/Mae', icon: UserCheck, color: '#10B981' },
  teacher: { label: 'Professor', icon: BookOpen, color: '#F59E0B' },
  admin: { label: 'Admin', icon: Shield, color: '#8B5CF6' },
};

export function UsersTable({ profiles }: UsersTableProps) {
  const kidCount = profiles.filter((p) => p.user_type === 'kid').length;
  const parentCount = profiles.filter((p) => p.user_type === 'parent').length;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-white/30" />
          <span className="text-white/50 text-sm">{profiles.length} usuarios</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-blue-400" />
          <span className="text-white/50 text-sm">{kidCount} alunos</span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck size={14} className="text-green-400" />
          <span className="text-white/50 text-sm">{parentCount} pais</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 text-white/30 text-xs font-medium">
          <div className="col-span-3">Nome</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-1">XP</div>
          <div className="col-span-1">Streak</div>
          <div className="col-span-2">Criado em</div>
        </div>

        {/* Rows */}
        {profiles.map((profile, i) => {
          const config = typeConfig[profile.user_type] || typeConfig.kid;

          return (
            <motion.div
              key={profile.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <div className="col-span-3 text-white text-sm truncate">
                {profile.name || 'Sem nome'}
              </div>
              <div className="col-span-3 text-white/50 text-xs truncate">
                {profile.email}
              </div>
              <div className="col-span-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  <config.icon size={10} />
                  {config.label}
                </span>
              </div>
              <div className="col-span-1 text-white/50 text-xs">
                {/* XP not directly on profile — would need stats join */}
                —
              </div>
              <div className="col-span-1 text-white/50 text-xs">
                —
              </div>
              <div className="col-span-2 text-white/30 text-xs">
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </div>
            </motion.div>
          );
        })}

        {profiles.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-white/30 text-sm">Nenhum usuario encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
