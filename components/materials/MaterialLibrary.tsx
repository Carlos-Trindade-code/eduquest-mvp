'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Search, Loader2 } from 'lucide-react';
import { MaterialCard } from './MaterialCard';
import { MaterialUpload } from './MaterialUpload';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { subjects } from '@/lib/subjects/config';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import { staggerContainer, fadeInUp } from '@/lib/design/animations';
import type { Material } from '@/lib/auth/types';

interface MaterialLibraryProps {
  kidId?: string;
  ownerType?: 'kid' | 'parent';
  onStudy?: (material: Material) => void;
  showUpload?: boolean;
}

export function MaterialLibrary({ kidId, ownerType = 'kid', onStudy, showUpload = true }: MaterialLibraryProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const { tokens } = useAgeTheme();
  const isYoungKid = tokens.animationIntensity === 'high';

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (kidId) params.set('kid_id', kidId);
      if (filter) params.set('subject', filter);

      const res = await fetch(`/api/materials?${params}`);
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch {
      setMaterials([]);
    }
    setLoading(false);
  }, [kidId, filter]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleDelete = async (material: Material) => {
    try {
      await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: material.id }),
      });
      setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    } catch {
      // ignore
    }
  };

  const handleView = (material: Material) => {
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    }
  };

  const handleUploaded = (material: Material) => {
    setMaterials((prev) => [material, ...prev]);
  };

  // Filter by search text
  const filtered = materials.filter((m) =>
    !search || m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header with search and filter */}
      <motion.div variants={fadeInUp('medium')} className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar materiais..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Subject filter pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              !filter ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/50 hover:text-white/70'
            }`}
          >
            Todos
          </button>
          {subjects.filter(s => s.id !== 'other').map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(filter === s.id ? null : s.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filter === s.id ? 'text-white' : 'bg-white/5 text-white/50 hover:text-white/70'
              }`}
              style={filter === s.id ? { backgroundColor: s.color } : undefined}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Upload section */}
      {showUpload && (
        <motion.div variants={fadeInUp('medium')}>
          {showUploader ? (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold">Adicionar material</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-white/40 hover:text-white/70 text-xs"
                >
                  Fechar
                </button>
              </div>
              <MaterialUpload
                kidId={kidId}
                ownerType={ownerType}
                onUploaded={(m) => { handleUploaded(m); setShowUploader(false); }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowUploader(true)}
              className={`w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl border border-dashed border-white/20 hover:border-purple-400 transition-all ${
                isYoungKid ? 'py-5 text-base font-bold' : 'py-3 text-sm'
              }`}
            >
              <FolderOpen size={isYoungKid ? 24 : 18} />
              {isYoungKid ? '➕ Adicionar material!' : '+ Adicionar material'}
            </button>
          )}
        </motion.div>
      )}

      {/* Materials grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-white/40" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={fadeInUp('medium')}
          className="flex flex-col items-center py-8 gap-3"
        >
          {isYoungKid && <MascotOwl expression="waving" size="lg" animated />}
          <p className={`text-white/40 ${isYoungKid ? 'text-base' : 'text-sm'}`}>
            {search ? 'Nenhum material encontrado' : 'Adicione seus materiais de estudo!'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className={`grid gap-3 ${isYoungKid ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}
        >
          <AnimatePresence>
            {filtered.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onStudy={onStudy}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
