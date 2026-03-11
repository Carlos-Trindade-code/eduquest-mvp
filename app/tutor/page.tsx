'use client';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/tutor/ChatInterface';

export default function TutorPage() {
  return (
    <div className="min-h-screen bg-gradient-app flex flex-col">
      <Header onTimerComplete={() => alert('Pausa! Voce estudou muito bem!')} />
      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-5 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
