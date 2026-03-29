'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Loader2, Trash2, ExternalLink, Upload } from 'lucide-react';
import { MaterialUpload } from '@/components/materials/MaterialUpload';
import { subjects } from '@/lib/subjects/config';
import { getSubjectById } from '@/lib/subjects/config';
import { getFileIcon, formatFileSize } from '@/lib/storage/materials';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { Material } from '@/lib/auth/types';

interface MaterialsTabProps {
  parentId: string;
  kidId: string;
  kidName: string;
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `Ha ${days} dias`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function MaterialsTab({ parentId, kidId, kidName }: MaterialsTabProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ kid_id: kidId });
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

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: id }),
      });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch { /* ignore */ }
  };

  const handleUploaded = (material: Material) => {
    setMaterials((prev) => [material, ...prev]);
    setShowUploader(false);
  };

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Upload section */}
      <motion.div variants={fadeInUp('medium')}>
        <AnimatePresence mode="wait">
          {showUploader ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold">
                  Enviar material para {kidName}
                </h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-white/40 hover:text-white/70 text-xs"
                >
                  Fechar
                </button>
              </div>
              <MaterialUpload
                kidId={kidId}
                ownerType="parent"
                onUploaded={handleUploaded}
              />
            </motion.div>
          ) : (
            <motion.button
              key="toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowUploader(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all text-sm font-medium"
            >
              <Upload size={16} />
              Enviar material para {kidName}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter pills */}
      <motion.div variants={fadeInUp('medium')} className="flex flex-wrap gap-1.5">
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
      </motion.div>

      {/* Materials list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-white/40" />
        </div>
      ) : materials.length === 0 ? (
        <motion.div variants={fadeInUp('medium')} className="flex flex-col items-center py-8 gap-2">
          <FolderOpen size={32} className="text-white/20" />
          <p className="text-white/40 text-sm">
            Nenhum material ainda. Envie PDFs, fotos ou documentos para {kidName} estudar!
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-2">
          {materials.map((m) => {
            const subjectInfo = m.subject ? getSubjectById(m.subject) : null;
            return (
              <motion.div
                key={m.id}
                variants={fadeInUp('medium')}
                className="flex items-center gap-3 glass rounded-xl p-3 group hover:bg-white/[0.06] transition-colors"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-lg">
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} alt="" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    getFileIcon(m.file_type)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{m.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {subjectInfo && (
                      <span className="text-[10px] font-medium" style={{ color: subjectInfo.color }}>
                        {subjectInfo.icon} {subjectInfo.name}
                      </span>
                    )}
                    <span className="text-white/25 text-[10px]">{relativeDate(m.created_at)}</span>
                    {m.file_size && (
                      <span className="text-white/20 text-[10px]">{formatFileSize(m.file_size)}</span>
                    )}
                    {m.content_text && (
                      <span className="text-green-400/50 text-[10px]">OCR ✓</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.file_url && (
                    <button
                      onClick={() => window.open(m.file_url!, '_blank')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
