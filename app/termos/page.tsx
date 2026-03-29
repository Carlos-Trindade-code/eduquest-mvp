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
        <p className="text-white/30 text-sm mb-8">Última atualização: 25 de março de 2026</p>

        <div className="prose-sm space-y-6 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar e usar a plataforma Studdo (www.studdo.com.br), você concorda com estes Termos de Uso. Se você é menor de 18 anos, seu responsável legal deve concordar com estes termos em seu nome.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. Descrição do Serviço</h2>
            <p>O Studdo é uma plataforma educacional que utiliza inteligência artificial para auxiliar estudantes de 4 a 18 anos em seus estudos, através de:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Tutor IA com método socrático</li>
              <li>Quizzes interativos gerados por IA</li>
              <li>Sistema de gamificação (XP, badges, streaks)</li>
              <li>Dashboard para pais acompanharem o progresso</li>
              <li>Ferramentas para professores e escolas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. Cadastro e Conta</h2>
            <p>Para utilizar funcionalidades completas, é necessário criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais. Pais e responsáveis podem criar contas para menores de idade sob sua supervisão.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. Uso Adequado</h2>
            <p>Você concorda em usar o Studdo apenas para fins educacionais legítimos. É proibido:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Usar o serviço para fins ilegais ou não autorizados</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Enviar conteúdo ofensivo, violento ou inapropriado</li>
              <li>Usar a IA para gerar conteúdo que viole direitos de terceiros</li>
              <li>Realizar engenharia reversa do sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">5. Conteúdo Gerado por IA</h2>
            <p>O tutor IA é uma ferramenta de apoio ao aprendizado. As respostas são geradas automaticamente e podem conter imprecisões. O Studdo não substitui professores, tutores humanos ou materiais didáticos oficiais. Recomendamos que pais e educadores acompanhem o uso.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">6. Propriedade Intelectual</h2>
            <p>Todo o conteúdo da plataforma (design, código, textos, ilustrações) é propriedade do Studdo. Materiais enviados por professores permanecem de propriedade dos mesmos.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">7. Planos e Pagamento</h2>
            <p>O Studdo oferece acesso gratuito para famílias. Planos para escolas e instituições são oferecidos sob consulta. Os termos específicos de cada plano serão apresentados no momento da contratação.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">8. Limitação de Responsabilidade</h2>
            <p>O Studdo é fornecido &ldquo;como está&rdquo;. Não garantimos disponibilidade ininterrupta ou ausência de erros. Não somos responsáveis por decisões tomadas com base no conteúdo gerado pela IA.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">9. Alterações nos Termos</h2>
            <p>Podemos atualizar estes termos a qualquer momento. Alterações significativas serão comunicadas por email ou notificação na plataforma.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">10. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato pelo formulário em <Link href="/escolas#contato" className="text-purple-400 hover:text-purple-300">studdo.com.br/escolas</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
