import { motion } from 'framer-motion';

interface StudyTrackProgressProps {
  subjects: string[];
  completed: string[];
}

export function StudyTrackProgress({ subjects, completed }: StudyTrackProgressProps) {
  return (
    <div className="flex items-center gap-4 mt-6">
      {subjects.map((subject, idx) => (
        <motion.div
          key={subject}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.2 }}
          className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 ${completed.includes(subject) ? 'border-green-400 bg-green-500/10' : 'border-purple-400 bg-purple-500/10'}`}
        >
          <span className={`font-bold text-lg ${completed.includes(subject) ? 'text-green-400' : 'text-purple-300'}`}>{subject}</span>
          <span className="text-xs mt-1">{completed.includes(subject) ? 'Concluído' : 'Em andamento'}</span>
        </motion.div>
      ))}
    </div>
  );
}
