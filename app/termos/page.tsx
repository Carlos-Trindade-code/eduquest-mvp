import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = { title: 'Termos de Uso' };

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-app">
      <header className="border-b border-white/5 bg-black/20 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="text-white font-bold text-lg">Studdo</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-white text-3xl font-extrabold mb-2">Termos de Uso</h1>
        <p className="text-white/30 text-sm mb-8">Ultima atualizacao: 25 de marco de 2026</p>

        <div className="prose-sm space-y-6 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. Aceitacao dos Termos</h2>
            <p>Ao acessar e usar a plataforma Studdo (www.studdo.com.br), voce concorda com estes Termos de Uso. Se voce e menor de 18 anos, seu responsavel legal deve concordar com estes termos em seu nome.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. Descricao do Servico</h2>
            <p>O Studdo e uma plataforma educacional que utiliza inteligencia artificial para auxiliar estudantes de 4 a 18 anos em seus estudos, atraves de:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Tutor IA com metodo socratico</li>
              <li>Quizzes interativos gerados por IA</li>
              <li>Sistema de gamificacao (XP, badges, streaks)</li>
              <li>Dashboard para pais acompanharem o progresso</li>
              <li>Ferramentas para professores e escolas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. Cadastro e Conta</h2>
            <p>Para utilizar funcionalidades completas, e necessario criar uma conta. Voce e responsavel por manter a confidencialidade de suas credenciais. Pais e responsaveis podem criar contas para menores de idade sob sua supervisao.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. Uso Adequado</h2>
            <p>Voce concorda em usar o Studdo apenas para fins educacionais legitimos. E proibido:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Usar o servico para fins ilegais ou nao autorizados</li>
              <li>Tentar acessar contas de outros usuarios</li>
              <li>Enviar conteudo ofensivo, violento ou inapropriado</li>
              <li>Usar a IA para gerar conteudo que viole direitos de terceiros</li>
              <li>Realizar engenharia reversa do sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">5. Conteudo Gerado por IA</h2>
            <p>O tutor IA e uma ferramenta de apoio ao aprendizado. As respostas sao geradas automaticamente e podem conter imprecisoes. O Studdo nao substitui professores, tutores humanos ou materiais didaticos oficiais. Recomendamos que pais e educadores acompanhem o uso.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">6. Propriedade Intelectual</h2>
            <p>Todo o conteudo da plataforma (design, codigo, textos, ilustracoes) e propriedade do Studdo. Materiais enviados por professores permanecem de propriedade dos mesmos.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">7. Planos e Pagamento</h2>
            <p>O Studdo oferece acesso gratuito para familias. Planos para escolas e instituicoes sao oferecidos sob consulta. Os termos especificos de cada plano serao apresentados no momento da contratacao.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">8. Limitacao de Responsabilidade</h2>
            <p>O Studdo e fornecido &ldquo;como esta&rdquo;. Nao garantimos disponibilidade ininterrupta ou ausencia de erros. Nao somos responsaveis por decisoes tomadas com base no conteudo gerado pela IA.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">9. Alteracoes nos Termos</h2>
            <p>Podemos atualizar estes termos a qualquer momento. Alteracoes significativas serao comunicadas por email ou notificacao na plataforma.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">10. Contato</h2>
            <p>Para duvidas sobre estes termos, entre em contato pelo formulario em <Link href="/escolas#contato" className="text-purple-400 hover:text-purple-300">studdo.com.br/escolas</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
