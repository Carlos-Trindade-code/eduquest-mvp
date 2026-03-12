import { TutorialPage } from '@/components/tutorial/TutorialPage';
import { Navbar } from '@/components/landing/Navbar';

export const metadata = {
  title: 'Como Usar | Studdo',
  description: 'Aprenda a usar o Studdo em 5 passos simples. Tutor IA que te guia a aprender de verdade.',
};

export default function Tutorial() {
  return (
    <>
      <Navbar />
      <TutorialPage />
    </>
  );
}
