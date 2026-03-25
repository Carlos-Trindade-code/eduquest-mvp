// components/tutor/HomeworkSetup.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, School } from 'lucide-react';
import { SubjectSelector } from './SubjectSelector';
import { AgeGroupSelector } from './AgeGroupSelector';
import { PhotoUpload } from './PhotoUpload';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface ClassroomMaterial {
  id: string;
  title: string;
  description: string | null;
  content_text: string | null;
  classroom_name?: string;
}

interface HomeworkSetupProps {
  onStart: (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => void;
}

export function HomeworkSetup({ onStart }: HomeworkSetupProps) {
  const [subject, setSubject] = useState('math');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [photoText, setPhotoText] = useState('');
  const [behavioralProfile] = useState<BehavioralProfile>('default');
  const [materials, setMaterials] = useState<ClassroomMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<ClassroomMaterial | null>(null);
  const { profile } = useAuth();

  // Load materials from student's classrooms
  useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClient();
    supabase
      .from('classroom_members')
      .select('classroom_id, classrooms(name, classroom_materials(id, title, description, content_text))')
      .eq('student_id', profile.id)
      .then(({ data }) => {
        if (!data) return;
        const mats: ClassroomMaterial[] = [];
        for (const row of data as any[]) {
          const classroom = row.classrooms;
          if (!classroom?.classroom_materials) continue;
          for (const m of classroom.classroom_materials) {
            if (m.content_text) {
              mats.push({ ...m, classroom_name: classroom.name });
            }
          }
        }
        setMaterials(mats);
      });
  }, [profile]);

  return (
    <motion.div
      className="glass p-6 sm:p-8 mt-4 sm:mt-6 rounded-[var(--eq-radius-lg)]"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp('high')} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <MascotOwl expression="waving" size="lg" animated />
        </div>
        <h1 className="text-[var(--eq-text)] text-2xl sm:text-3xl font-extrabold mb-2">
          O que vamos estudar?
        </h1>
        <p className="text-[var(--eq-text-secondary)] text-sm">
          Escolha a matéria e sua idade — o Edu faz o resto ✨
        </p>
      </motion.div>

      {/* Subject */}
      <motion.div variants={fadeInUp('medium')}>
        <SubjectSelector selected={subject} onSelect={setSubject} label="Qual matéria?" />
      </motion.div>

      {/* Age Group */}
      <motion.div variants={fadeInUp('medium')}>
        <AgeGroupSelector selected={ageGroup} onSelect={setAgeGroup} label="Qual sua idade?" />
      </motion.div>

      {/* Classroom materials */}
      {materials.length > 0 && (
        <motion.div variants={fadeInUp('medium')} className="mb-1">
          <p className="text-[var(--eq-text-secondary)] text-sm mb-2 font-medium flex items-center gap-1.5">
            <School size={14} />
            Material do professor
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {materials.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMaterial(selectedMaterial?.id === m.id ? null : m)}
                className={`w-full text-left rounded-xl p-3 transition-all ${
                  selectedMaterial?.id === m.id ? 'ring-1 ring-purple-500' : ''
                }`}
                style={{
                  background: selectedMaterial?.id === m.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedMaterial?.id === m.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-white/30 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{m.title}</p>
                    {m.classroom_name && (
                      <p className="text-white/25 text-[10px] truncate">{m.classroom_name}</p>
                    )}
                  </div>
                  {selectedMaterial?.id === m.id && (
                    <span className="text-purple-400 text-[10px] font-bold shrink-0 ml-auto">Selecionado</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Photo Upload — optional */}
      <motion.div variants={fadeInUp('medium')} className="mb-1">
        <p className="text-[var(--eq-text-secondary)] text-sm mb-2 font-medium">
          Tem foto da tarefa? (opcional)
        </p>
        <PhotoUpload onTextExtracted={setPhotoText} />
        {photoText && (
          <p className="text-xs mt-1.5" style={{ color: 'rgba(240,244,248,0.4)' }}>
            ✓ Foto lida — o Edu vai perguntar sobre ela
          </p>
        )}
      </motion.div>

      {/* Submit — always enabled (no homework text required) */}
      <motion.div variants={fadeInUp('medium')}>
        <Button
          onClick={() => {
            const context = [
              selectedMaterial?.content_text ? `[Material do professor: ${selectedMaterial.title}]\n${selectedMaterial.content_text}` : '',
              photoText,
            ].filter(Boolean).join('\n\n');
            onStart({ homework: context, subject, ageGroup, behavioralProfile });
          }}
          variant="primary"
          size="lg"
          rounded="lg"
          className="w-full mt-4 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Começar com o Edu ✨
        </Button>
      </motion.div>
    </motion.div>
  );
}
