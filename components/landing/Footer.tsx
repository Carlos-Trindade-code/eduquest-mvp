'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer>
      {/* CTA final */}
      <div className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2942 0%, #0D1B2A 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.07),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🦉</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Comece grátis. Sem cartão.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(240,244,248,0.55)' }}>
            Seu filho tem 7 dias para testar. Se não gostar, não paga nada.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
            style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 8px 40px rgba(245,166,35,0.4)' }}
          >
            Criar conta gratuita
            <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-xs" style={{ color: 'rgba(240,244,248,0.3)' }}>
            Já são famílias estudando com o Studdo 🚀
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0D1B2A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00B4D8, #8B5CF6)' }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              Stud<span style={{ color: '#F5A623' }}>do</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm" style={{ color: 'rgba(240,244,248,0.3)' }}>
            <Link href="/escolas" className="hover:text-white transition-colors">Para Escolas</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(240,244,248,0.5)' }}>
            © {new Date().getFullYear()} Studdo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
