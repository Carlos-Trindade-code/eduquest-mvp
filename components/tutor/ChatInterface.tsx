'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RotateCcw } from 'lucide-react';
import { HomeworkSetup } from './HomeworkSetup';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { useChatSession } from '@/hooks/useChatSession';
import { getSubjectById } from '@/lib/subjects/config';
import { SubjectIcon } from '@/components/illustrations/SubjectIcons';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface ChatInterfaceProps {
  labels?: {
    changeHomework: string;
    typeAnswer: string;
    greeting: string;
  };
}

const defaultLabels = {
  changeHomework: 'trocar',
  typeAnswer: 'Digite sua resposta...',
  greeting:
    'Oi! Vamos resolver esse dever juntos!\n\nLi sua tarefa: "{homework}"\n\nPor onde voce acha que devemos comecar?',
};

export function ChatInterface({ labels }: ChatInterfaceProps) {
  const [homework, setHomework] = useState('');
  const [subject, setSubject] = useState('other');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [behavioralProfile, setBehavioralProfile] = useState<BehavioralProfile>('default');
  const [homeworkSet, setHomeworkSet] = useState(false);
  const l = { ...defaultLabels, ...labels };

  const { messages, input, loading, setInput, sendMessage, initSession, resetSession } =
    useChatSession(homework, subject, ageGroup, behavioralProfile);

  const handleStart = (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => {
    setHomework(config.homework);
    setSubject(config.subject);
    setAgeGroup(config.ageGroup);
    setBehavioralProfile(config.behavioralProfile);
    setHomeworkSet(true);
    const greeting = l.greeting.replace('{homework}', config.homework);
    initSession(config.homework, greeting);
  };

  const handleReset = () => {
    setHomeworkSet(false);
    setHomework('');
    setSubject('other');
    resetSession();
  };

  if (!homeworkSet) {
    return (
      <AgeThemeProvider ageGroup={ageGroup}>
        <HomeworkSetup onStart={handleStart} />
      </AgeThemeProvider>
    );
  }

  const subjectInfo = getSubjectById(subject);

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
      {/* Homework banner */}
      <motion.div
        className="flex items-center gap-3 glass rounded-[var(--eq-radius-sm)] p-3 mb-3 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {subjectInfo ? (
          <SubjectIcon subject={subjectInfo.id} size={24} animated={false} />
        ) : (
          <BookOpen size={16} className="text-[var(--eq-accent)] shrink-0" />
        )}
        <p className="text-[var(--eq-text-secondary)] text-xs flex-1 line-clamp-2">
          {homework}
        </p>
        <button
          onClick={handleReset}
          className="text-[var(--eq-text-muted)] hover:text-[var(--eq-text)] text-xs shrink-0 transition-colors flex items-center gap-1"
        >
          <RotateCcw size={12} />
          {l.changeHomework}
        </button>
      </motion.div>

      <MessageList messages={messages} loading={loading} />

      <MessageInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={loading}
        placeholder={l.typeAnswer}
      />
    </AgeThemeProvider>
  );
}
