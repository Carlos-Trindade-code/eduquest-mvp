import { Home } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import Link from 'next/link';
import { NotFoundActions } from '@/components/layout/NotFoundActions';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <MascotOwl expression="thinking" size="lg" />

        <h1 className="text-white text-5xl font-black mt-6 mb-2">404</h1>
        <h2 className="text-white text-xl font-bold mb-2">
          Página não encontrada
        </h2>
        <p className="text-white/50 text-sm mb-8">
          Parece que você se perdeu no caminho. Vamos te levar de volta!
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/25 hover:opacity-90 transition-opacity"
          >
            <Home size={16} />
            Ir para o início
          </Link>

          <NotFoundActions />
        </div>
      </div>
    </div>
  );
}
