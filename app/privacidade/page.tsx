import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = { title: 'Política de Privacidade' };

export default function PrivacidadePage() {
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
        <h1 className="text-white text-3xl font-extrabold mb-2">Política de Privacidade</h1>
        <p className="text-white/30 text-sm mb-8">Última atualização: 25 de março de 2026</p>

        <div className="prose-sm space-y-6 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. Compromisso com a Privacidade</h2>
            <p>O Studdo se compromete a proteger a privacidade de todos os usuários, especialmente menores de idade. Esta política descreve como coletamos, usamos e protegemos seus dados, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018) e o Estatuto da Criança e do Adolescente (ECA).</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. Dados que Coletamos</h2>
            <h3 className="text-white/80 font-semibold text-sm mt-3 mb-1">Dados de cadastro:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome, email, tipo de usuário (aluno, pai/mãe, professor)</li>
              <li>Idade e série escolar (opcional, para personalizar o tutor)</li>
            </ul>
            <h3 className="text-white/80 font-semibold text-sm mt-3 mb-1">Dados de uso:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sessões de estudo (matéria, duração, mensagens trocadas com o tutor)</li>
              <li>Resultados de quizzes (acertos, nota)</li>
              <li>XP, badges e progresso na gamificação</li>
              <li>Materiais enviados por professores (armazenados de forma segura)</li>
            </ul>
            <h3 className="text-white/80 font-semibold text-sm mt-3 mb-1">Dados que NÃO coletamos:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Localização precisa (GPS)</li>
              <li>Dados biométricos</li>
              <li>Informações financeiras (não processamos pagamentos diretamente)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. Como Usamos os Dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white/80">Personalizar o tutor:</strong> adaptar linguagem e dificuldade por idade</li>
              <li><strong className="text-white/80">Gamificação:</strong> calcular XP, streaks e badges</li>
              <li><strong className="text-white/80">Dashboard para pais:</strong> mostrar progresso do filho (somente para pais vinculados)</li>
              <li><strong className="text-white/80">Painel do professor:</strong> acompanhar alunos da turma</li>
              <li><strong className="text-white/80">Melhorar o produto:</strong> analytics anonimizados de uso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. Proteção de Menores</h2>
            <p>O Studdo segue as diretrizes do ECA e da LGPD para proteção de dados de crianças e adolescentes:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Menores de 12 anos devem ter cadastro realizado por um responsável</li>
              <li>O conteúdo gerado pela IA é filtrado para ser adequado à faixa etária</li>
              <li>Não exibimos publicidade ou anúncios</li>
              <li>Não compartilhamos dados de menores com terceiros para fins comerciais</li>
              <li>Pais podem solicitar exclusão dos dados do filho a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">5. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados apenas com:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-white/80">Supabase:</strong> infraestrutura de banco de dados e autenticação (servidores nos EUA)</li>
              <li><strong className="text-white/80">Google Gemini:</strong> processamento de mensagens do tutor IA (as mensagens são enviadas para gerar respostas, sem armazenamento permanente pela Google)</li>
              <li><strong className="text-white/80">Railway:</strong> hospedagem da aplicação</li>
            </ul>
            <p className="mt-2">Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">6. Armazenamento e Segurança</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados armazenados em banco PostgreSQL com criptografia em repouso</li>
              <li>Comunicação via HTTPS (TLS 1.3)</li>
              <li>Row Level Security (RLS) — cada usuário só acessa seus próprios dados</li>
              <li>Senhas hasheadas com bcrypt (nunca armazenadas em texto plano)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">7. Seus Direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusão da sua conta e dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados</li>
            </ul>
            <p className="mt-2">Para exercer esses direitos, entre em contato pelo formulário em <Link href="/escolas#contato" className="text-purple-400 hover:text-purple-300">studdo.com.br/escolas</Link>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">8. Cookies</h2>
            <p>Utilizamos cookies essenciais para manter sua sessão de login ativa. Não utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">9. Alterações nesta Política</h2>
            <p>Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas por email ou notificação na plataforma.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">10. Contato do Encarregado (DPO)</h2>
            <p>Para questões relacionadas a privacidade e proteção de dados, entre em contato pelo formulário em <Link href="/escolas#contato" className="text-purple-400 hover:text-purple-300">studdo.com.br/escolas</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
