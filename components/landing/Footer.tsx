'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Edu<span className="text-purple-400">Quest</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#features" className="hover:text-white/70 transition-colors">
              Recursos
            </a>
            <a href="#ages" className="hover:text-white/70 transition-colors">
              Idades
            </a>
            <a href="#how-it-works" className="hover:text-white/70 transition-colors">
              Como Funciona
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} EduQuest. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
