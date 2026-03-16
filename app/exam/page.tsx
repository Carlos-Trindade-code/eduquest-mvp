'use client';

import { useState } from 'react';
import { ExamGenerator, type ExamData } from '@/components/exam/ExamGenerator';
import { ExamPreview } from '@/components/exam/ExamPreview';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function ExamPage() {
  const [exam, setExam] = useState<ExamData | null>(null);

  return (
    <div className="min-h-screen bg-gradient-app">
      {/* Simple header */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/20">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={22} />
          <span className="text-white font-bold text-xl">Studdo</span>
        </Link>
      </header>

      <main className="px-4 py-6 sm:py-10">
        {!exam ? (
          <ExamGenerator onExamGenerated={setExam} />
        ) : (
          <ExamPreview exam={exam} onBack={() => setExam(null)} />
        )}
      </main>
    </div>
  );
}
