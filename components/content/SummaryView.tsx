'use client';

import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, X, Volume2 } from 'lucide-react';
import { speak, hasTTSSupport } from '@/lib/audio/tts';

interface SummarySection {
  heading: string;
  content: string;
  keyPoints: string[];
}

interface KeyTerm {
  term: string;
  definition: string;
}

interface SummaryData {
  title: string;
  sections: SummarySection[];
  keyTerms?: KeyTerm[];
  tipToRemember?: string;
}

interface SummaryViewProps {
  data: SummaryData;
  onClose: () => void;
}

export function SummaryView({ data, onClose }: SummaryViewProps) {
  const hasTTS = hasTTSSupport();

  const handleSpeak = (text: string) => {
    speak(text);
  };

  return (
    <motion.div
      className="flex flex-col gap-4 overflow-y-auto max-h-[80vh] pb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 py-2" style={{ background: 'var(--eq-bg, #1E1046)' }}>
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-purple-400" />
          <h2 className="text-white font-bold text-lg">{data.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Sections */}
      {data.sections.map((section, i) => (
        <motion.div
          key={i}
          className="glass rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-purple-300 font-bold text-sm">{section.heading}</h3>
            {hasTTS && (
              <button
                onClick={() => handleSpeak(`${section.heading}. ${section.content}`)}
                className="text-white/20 hover:text-white/60 transition-colors"
              >
                <Volume2 size={14} />
              </button>
            )}
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-3">{section.content}</p>
          {section.keyPoints.length > 0 && (
            <ul className="space-y-1">
              {section.keyPoints.map((point, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-white/50">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}

      {/* Key Terms */}
      {data.keyTerms && data.keyTerms.length > 0 && (
        <motion.div
          className="glass rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: data.sections.length * 0.1 }}
        >
          <h3 className="text-cyan-300 font-bold text-sm mb-3">Termos-chave</h3>
          <div className="grid gap-2">
            {data.keyTerms.map((kt, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-cyan-400 font-bold shrink-0">{kt.term}:</span>
                <span className="text-white/50">{kt.definition}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tip */}
      {data.tipToRemember && (
        <motion.div
          className="flex items-start gap-3 rounded-xl p-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (data.sections.length + 1) * 0.1 }}
        >
          <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-bold text-xs mb-1">Dica para lembrar</p>
            <p className="text-white/60 text-xs">{data.tipToRemember}</p>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(139,92,246,0.15)', color: 'rgba(139,92,246,0.9)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          Voltar
        </button>
      </div>
    </motion.div>
  );
}
