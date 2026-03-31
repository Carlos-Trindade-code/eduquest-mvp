'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCheck, Shield, BookOpen } from 'lucide-react';
import type { Profile } from '@/lib/auth/types';

interface UsersTableProps {
  profiles: Profile[];
  loading?: boolean;
}

const PAGE_SIZE = 50;

const typeConfig: Record<string, { label: string; icon: typeof GraduationCap; color: string }> = {
  kid: { label: 'Aluno', icon: GraduationCap, color: '#3B82F6' },
  parent: { label: 'Pai/Mae', icon: UserCheck, color: '#10B981' },
  teacher: { label: 'Professor', icon: BookOpen, color: '#F59E0B' },
  admin: { label: 'Admin', icon: Shield, color: '#8B5CF6' },
};

export function UsersTable({ profiles, loading }: UsersTableProps) {
  const [page, setPage] = useState(1);
  const kidCount = profiles.filter((p) => p.user_type === 'kid').length;
  const parentCount = profiles.filter((p) => p.user_type === 'parent').length;
  const paginated = profiles.slice(0, page * PAGE_SIZE);

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
        {loading && profiles.length === 0 && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5">
              {[3, 3, 2, 1, 1, 2].map((span, j) => (
                <div key={j} className={`col-span-${span} h-4 rounded bg-white/5 animate-pulse`} />
              ))}
            </div>
          ))
        )}
        {paginated.map((profile, i) => {
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

        {!loading && profiles.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-white/30 text-sm">Nenhum usuario encontrado</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {profiles.length > 0 && (
        <p className="text-xs text-white/30 text-right mt-3">
          Exibindo {Math.min(page * PAGE_SIZE, profiles.length)} de {profiles.length}
        </p>
      )}
      {profiles.length > page * PAGE_SIZE && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-2 mt-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-colors"
        >
          Carregar mais ({profiles.length - page * PAGE_SIZE} restantes)
        </button>
      )}
    </div>
  );
}
