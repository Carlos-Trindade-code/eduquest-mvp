'use client';

import { useState, useEffect } from 'react';
import { FeedbackModal } from './FeedbackModal';

interface PostSessionFeedbackProps {
  triggered: boolean;
  subjectContext?: string;
  onDismiss: () => void;
}

export function PostSessionFeedback({ triggered, subjectContext, onDismiss }: PostSessionFeedbackProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (triggered) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [triggered]);

  function handleClose() {
    setOpen(false);
    onDismiss();
  }

  return (
    <FeedbackModal
      isOpen={open}
      onClose={handleClose}
      source="post_session"
      subjectContext={subjectContext}
    />
  );
}
