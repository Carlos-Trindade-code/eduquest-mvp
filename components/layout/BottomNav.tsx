'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, FileText, Sparkles, User } from 'lucide-react';

const navItems = [
  { href: '/tutor', label: 'Tutor', icon: MessageCircle },
  { href: '/exam', label: 'Simulado', icon: FileText },
  { href: '/materials', label: 'Materiais', icon: Sparkles },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0D1B2A]/95 backdrop-blur-lg border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? 'text-purple-400'
                  : 'text-white/35 active:text-white/60'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
