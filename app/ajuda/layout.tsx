import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ajuda' };

export default function AjudaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
