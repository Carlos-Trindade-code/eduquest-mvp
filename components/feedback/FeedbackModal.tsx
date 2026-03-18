'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { submitFeedback } from '@/lib/supabase/queries';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: 'floating_button' | 'post_session';
  subjectContext?: string;
}

function createSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function FeedbackModal({ isOpen, onClose, source, subjectContext }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const title = subjectContext
    ? `Como foi sua sessão de ${subjectContext}?`
    : 'Como está sendo sua experiência?';

  async function handleSubmit() {
    if (rating === 0) return;
    setLoading(true);
    const supabase = createSupabase();
    await submitFeedback(supabase, rating, comment.trim() || null, source);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setRating(0);
      setComment('');
      onClose();
    }, 1800);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 glass rounded-2xl p-6 shadow-2xl border border-white/10"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {success ? (
              <motion.div
                className="flex flex-col items-center py-4 gap-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <CheckCircle size={40} className="text-green-400" />
                <p className="text-white font-semibold text-center">Obrigado pelo feedback!</p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <p className="text-white font-semibold text-sm leading-snug pr-2">{title}</p>
                  <button onClick={onClose} className="text-white/40 hover:text-white shrink-0">
                    <X size={16} />
                  </button>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          star <= (hovered || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-white/20'
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Comentário opcional..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-purple-500/50 mb-4"
                />

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded-xl text-white/50 hover:text-white text-sm transition-colors"
                  >
                    Agora não
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || loading}
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Enviar
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
