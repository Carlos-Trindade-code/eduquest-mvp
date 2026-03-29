import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Metodo Socratico na Educacao — Como funciona | Studdo',
  description: 'Descubra como o metodo socratico aplicado com inteligencia artificial ajuda criancas a desenvolver pensamento critico, autonomia e aprendizado profundo.',
  openGraph: {
    title: 'Metodo Socratico na Educacao — Studdo',
    description: 'Como o metodo socratico com IA desenvolve pensamento critico em criancas.',
  },
};

export default function MetodoSocraticoPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1E1046 50%, #0D1B2A 100%)' }}>
      <header className="px-6 py-4 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">Studdo</Link>
          <Link
            href="/tutor"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            Experimentar
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <article className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 !leading-tight">
            O que é o Método Socrático e<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              por que ele funciona
            </span>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed mb-8">
            O método socrático, criado por Sócrates há mais de 2.400 anos, é uma das técnicas de ensino mais eficazes já inventadas. Em vez de simplesmente fornecer respostas, o professor faz perguntas estratégicas que guiam o aluno a descobrir o conhecimento por conta própria.
          </p>

          <div className="space-y-8">
            <section className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-white font-bold text-xl mb-3">Como funciona na prática</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                Imagine que um aluno pergunta: &ldquo;Quanto é 7 × 8?&rdquo;
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-red-400 font-bold shrink-0">❌</span>
                  <p className="text-white/50"><strong className="text-white/70">Método tradicional:</strong> &ldquo;A resposta é 56.&rdquo;</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold shrink-0">✅</span>
                  <p className="text-white/50"><strong className="text-white/70">Método socrático:</strong> &ldquo;Você sabe quanto é 7 × 7? Ótimo, 49! Então, se adicionarmos mais um grupo de 7, quanto ficaria?&rdquo;</p>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-white font-bold text-xl mb-3">Benefícios comprovados</h2>
              <ul className="space-y-2 text-white/50">
                <li className="flex gap-2"><span className="text-purple-400">•</span> <strong className="text-white/70">Pensamento crítico:</strong> O aluno aprende a questionar e analisar, não apenas memorizar.</li>
                <li className="flex gap-2"><span className="text-purple-400">•</span> <strong className="text-white/70">Retenção profunda:</strong> Conhecimento descoberto ativamente é retido por muito mais tempo.</li>
                <li className="flex gap-2"><span className="text-purple-400">•</span> <strong className="text-white/70">Autonomia:</strong> A criança desenvolve confiança para resolver problemas sozinha.</li>
                <li className="flex gap-2"><span className="text-purple-400">•</span> <strong className="text-white/70">Metacognição:</strong> O aluno aprende a pensar sobre seu próprio processo de pensamento.</li>
                <li className="flex gap-2"><span className="text-purple-400">•</span> <strong className="text-white/70">Transferência:</strong> Habilidades de raciocínio se aplicam a todas as matérias e situações da vida.</li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="text-white font-bold text-xl mb-3">Método socrático + IA = Studdo</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                O Studdo combina o método socrático com inteligência artificial para oferecer tutoria personalizada 24/7. Nosso tutor Edu 🦉 adapta as perguntas ao nível, idade e ritmo de cada criança.
              </p>
              <p className="text-white/50 leading-relaxed">
                Diferente de um chatbot comum que dá respostas prontas, o Edu foi treinado para nunca entregar a solução diretamente. Ele guia, incentiva, celebra acertos e ajuda nos erros — como o melhor professor particular que existe.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-white/40 mb-4">Quer ver o método socrático em ação?</p>
            <Link
              href="/tutor"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90"
              style={{ background: '#F5A623', color: '#0D1B2A' }}
            >
              Testar o Edu grátis
              <ArrowRight size={18} />
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-white/5 px-6 py-6 text-center">
        <p className="text-white/20 text-xs">
          Studdo — Tutor IA que ensina de verdade | <Link href="/como-funciona" className="hover:text-white/40">Como funciona</Link> | <Link href="/privacidade" className="hover:text-white/40">Privacidade</Link>
        </p>
      </footer>
    </div>
  );
}
