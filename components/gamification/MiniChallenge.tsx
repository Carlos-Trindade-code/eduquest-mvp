import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ConfettiEffect } from './ConfettiEffect';

interface MiniChallengeProps {
  challenge: string;
  onSuccess?: () => void;
}

export function MiniChallenge({ challenge, onSuccess }: MiniChallengeProps) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    if (onSuccess) onSuccess();
  };

  return (
    <motion.div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex flex-col items-center mt-4">
      <div className="font-bold text-purple-300 mb-2">Mini-desafio</div>
      <div className="text-white text-lg mb-3">{challenge}</div>
      {!completed ? (
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition"
          onClick={handleComplete}
        >
          Concluir desafio
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <Sparkles className="text-yellow-400 mb-2" size={32} />
          <span className="text-green-400 font-bold">Parabéns! Você ganhou XP extra 🎉</span>
          <ConfettiEffect active={true} />
        </div>
      )}
    </motion.div>
  );
}
