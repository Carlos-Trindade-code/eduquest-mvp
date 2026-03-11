'use client';

import { motion } from 'framer-motion';
import { subjects } from '@/lib/subjects/config';
import { SubjectIcon } from '@/components/illustrations/SubjectIcons';
import { cn } from '@/lib/utils';

interface SubjectSelectorProps {
  selected: string;
  onSelect: (subjectId: string) => void;
  label?: string;
}

export function SubjectSelector({
  selected,
  onSelect,
  label = 'Escolha a materia',
}: SubjectSelectorProps) {
  return (
    <div className="mb-5">
      <p className="text-[var(--eq-text-secondary)] text-sm mb-3 font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {subjects.map((subject) => {
          const isSelected = selected === subject.id;
          return (
            <motion.button
              key={subject.id}
              onClick={() => onSelect(subject.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-center gap-3 px-3.5 py-3 rounded-[var(--eq-radius-sm)] text-left text-sm transition-all',
                isSelected
                  ? 'text-white border-2 shadow-lg'
                  : 'bg-[var(--eq-surface)] text-[var(--eq-text-muted)] border-2 border-transparent hover:bg-[var(--eq-surface-hover)] hover:text-[var(--eq-text)]'
              )}
              style={
                isSelected
                  ? {
                      background: `${subject.color}20`,
                      borderColor: `${subject.color}80`,
                      boxShadow: `0 4px 15px ${subject.color}15`,
                    }
                  : undefined
              }
            >
              <SubjectIcon
                subject={subject.id}
                size={32}
                animated={isSelected}
              />
              <span className="font-medium">{subject.name}</span>
              {isSelected && (
                <motion.div
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: subject.color }}
                  layoutId="subject-dot"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
