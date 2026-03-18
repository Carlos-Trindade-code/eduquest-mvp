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
  labels?: {
    title: string;
    subtitle: string;
    placeholder: string;
    button: string;
    selectSubject: string;
    selectAge: string;
    orUploadPhoto: string;
  };
}

const defaultLabels = {
  title: 'Qual é o desafio de hoje?',
  subtitle: 'Me conta o que está estudando — eu te ajudo a entender de verdade 🎯',
  placeholder: 'Ex: Quais foram as causas da Revolução Francesa?',
  button: 'Começar com o Edu ✨',
  selectSubject: 'Qual matéria?',
  selectAge: 'Qual sua idade?',
  orUploadPhoto: 'Ou tire uma foto do dever:',
};

export function HomeworkSetup({ onStart, labels }: HomeworkSetupProps) {
  const [homework, setHomework] = useState('');
  const [subject, setSubject] = useState('other');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [behavioralProfile] = useState<BehavioralProfile>('default');
  const l = { ...defaultLabels, ...labels };

  const handlePhotoExtracted = (text: string) => {
    setHomework(text);
  };

  return (
    <motion.div
      className="glass p-6 sm:p-8 mt-4 sm:mt-6 rounded-[var(--eq-radius-lg)]"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header with mascot */}
      <motion.div variants={fadeInUp('high')} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <MascotOwl expression="waving" size="lg" animated />
        </div>
        <h1 className="text-[var(--eq-text)] text-2xl sm:text-3xl font-extrabold mb-2">
          {l.title}
        </h1>
        <p className="text-[var(--eq-text-secondary)] text-sm">{l.subtitle}</p>
      </motion.div>

      {/* Age Group */}
      <motion.div variants={fadeInUp('medium')}>
        <AgeGroupSelector
          selected={ageGroup}
          onSelect={setAgeGroup}
          label={l.selectAge}
        />
      </motion.div>

      {/* Subject */}
      <motion.div variants={fadeInUp('medium')}>
        <SubjectSelector
          selected={subject}
          onSelect={setSubject}
          label={l.selectSubject}
        />
      </motion.div>

      {/* Photo Upload */}
      <motion.div variants={fadeInUp('medium')} className="mb-5">
        <p className="text-[var(--eq-text-secondary)] text-sm mb-2 font-medium">
          {l.orUploadPhoto}
        </p>
        <PhotoUpload onTextExtracted={handlePhotoExtracted} />
      </motion.div>

      {/* Text Area */}
      <motion.div variants={fadeInUp('medium')}>
        <textarea
          value={homework}
          onChange={(e) => setHomework(e.target.value)}
          placeholder={l.placeholder}
          className="w-full bg-[var(--eq-surface)] text-[var(--eq-text)] placeholder:text-[var(--eq-text-muted)] rounded-[var(--eq-radius-sm)] p-4 min-h-28 sm:min-h-36 resize-none border border-[var(--eq-surface-border)] focus:outline-none focus:ring-2 focus:ring-[var(--eq-primary)]/40 focus:border-[var(--eq-primary)] text-sm transition-all backdrop-blur-md"
        />
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeInUp('medium')}>
        <Button
          onClick={() => onStart({ homework, subject, ageGroup, behavioralProfile })}
          disabled={!homework.trim()}
          variant="primary"
          size="lg"
          rounded="lg"
          className="w-full mt-4 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {l.button}
        </Button>
      </motion.div>
    </motion.div>
  );
}
