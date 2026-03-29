'use client';

import { motion } from 'framer-motion';
import { Trash2, BookOpen, ExternalLink } from 'lucide-react';
import { getSubjectById } from '@/lib/subjects/config';
import { getFileIcon, formatFileSize } from '@/lib/storage/materials';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import type { Material } from '@/lib/auth/types';

interface MaterialCardProps {
  material: Material;
  onStudy?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onView?: (material: Material) => void;
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `Ha ${days} dias`;
  if (days < 30) return `Ha ${Math.floor(days / 7)} sem.`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function MaterialCard({ material, onStudy, onDelete, onView }: MaterialCardProps) {
  const { tokens } = useAgeTheme();
  const isYoungKid = tokens.animationIntensity === 'high';
  const subjectInfo = material.subject ? getSubjectById(material.subject) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative glass rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400/30 transition-all ${
        isYoungKid ? 'p-4' : 'p-3'
      }`}
    >
      {/* Thumbnail */}
      <div className={`rounded-xl overflow-hidden bg-white/5 mb-3 flex items-center justify-center ${
        isYoungKid ? 'h-28' : 'h-20'
      }`}>
        {material.thumbnail_url ? (
          <img
            src={material.thumbnail_url}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={isYoungKid ? 'text-4xl' : 'text-3xl'}>
            {getFileIcon(material.file_type)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-white font-semibold truncate ${isYoungKid ? 'text-base' : 'text-sm'}`}>
        {material.title}
      </h3>

      {/* Subject badge + date */}
      <div className="flex items-center gap-2 mt-1.5">
        {subjectInfo && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
            style={{ backgroundColor: subjectInfo.color + '80' }}
          >
            {subjectInfo.icon} {subjectInfo.name}
          </span>
        )}
        <span className="text-white/30 text-[10px]">
          {relativeDate(material.created_at)}
        </span>
      </div>

      {/* File info */}
      {material.file_size && (
        <p className="text-white/20 text-[10px] mt-1">
          {formatFileSize(material.file_size)}
        </p>
      )}

      {/* Actions */}
      <div className={`flex gap-1.5 mt-3 ${isYoungKid ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
        {onStudy && material.content_text && (
          <button
            onClick={() => onStudy(material)}
            className={`flex-1 flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors ${
              isYoungKid ? 'py-2.5 text-sm font-bold' : 'py-1.5 text-xs'
            }`}
          >
            <BookOpen size={isYoungKid ? 16 : 12} />
            {isYoungKid ? 'Estudar!' : 'Estudar com Edu'}
          </button>
        )}
        {onView && material.file_url && (
          <button
            aria-label="Abrir material"
            onClick={() => onView(material)}
            className={`flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-colors ${
              isYoungKid ? 'p-2.5' : 'p-1.5'
            }`}
          >
            <ExternalLink size={isYoungKid ? 16 : 12} />
          </button>
        )}
        {onDelete && (
          <button
            aria-label="Deletar material"
            onClick={() => onDelete(material)}
            className={`flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-colors ${
              isYoungKid ? 'p-2.5' : 'p-1.5'
            }`}
          >
            <Trash2 size={isYoungKid ? 16 : 12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
