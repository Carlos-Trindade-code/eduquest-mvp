// components/tutor/HomeworkSetup.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SubjectSelector } from './SubjectSelector';
import { AgeGroupSelector } from './AgeGroupSelector';
import { PhotoUpload } from './PhotoUpload';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

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
          onClick={() => onStart({ homework: photoText, subject, ageGroup, behavioralProfile })}
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
