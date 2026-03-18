'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-900/50 flex items-center justify-center text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Enviar feedback"
      >
        <MessageSquarePlus size={20} />
      </motion.button>

      <FeedbackModal
        isOpen={open}
        onClose={() => setOpen(false)}
        source="floating_button"
      />
    </>
  );
}
