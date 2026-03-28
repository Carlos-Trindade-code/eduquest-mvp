import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Para Escolas e Professores' };

export default function EscolasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
