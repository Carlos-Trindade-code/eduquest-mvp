import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = { title: 'Politica de Privacidade' };

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
        <h1 className="text-white text-3xl font-extrabold mb-2">Politica de Privacidade</h1>
        <p className="text-white/30 text-sm mb-8">Ultima atualizacao: 25 de marco de 2026</p>

        <div className="prose-sm space-y-6 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-2">1. Compromisso com a Privacidade</h2>
            <p>O Studdo se compromete a proteger a privacidade de todos os usuarios, especialmente menores de idade. Esta politica descreve como coletamos, usamos e protegemos seus dados, em conformidade com a Lei Geral de Protecao de Dados (LGPD — Lei 13.709/2018) e o Estatuto da Crianca e do Adolescente (ECA).</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">2. Dados que Coletamos</h2>
            <h3 className="text-white/80 font-semibold text-sm mt-3 mb-1">Dados de cadastro:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nome, email, tipo de usuario (aluno, pai/mae, professor)</li>
              <li>Idade e serie escolar (opcional, para personalizar o tutor)</li>
            </ul>
            <h3 className="text-white/80 font-semibold text-sm mt-3 mb-1">Dados de uso:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sessoes de estudo (materia, duracao, mensagens trocadas com o tutor)</li>
              <li>Resultados de quizzes (acertos, nota)</li>
              <li>XP, badges e progresso na gamificacao</li>
              <li>Materiais enviados por professores (armazenados de forma segura)</li>
            </ul>
            <h3 className="text-white/80 font-semibold text-sm mt-3 mb-1">Dados que NAO coletamos:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Localizacao precisa (GPS)</li>
              <li>Dados biometricos</li>
              <li>Informacoes financeiras (nao processamos pagamentos diretamente)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">3. Como Usamos os Dados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-white/80">Personalizar o tutor:</strong> adaptar linguagem e dificuldade por idade</li>
              <li><strong className="text-white/80">Gamificacao:</strong> calcular XP, streaks e badges</li>
              <li><strong className="text-white/80">Dashboard para pais:</strong> mostrar progresso do filho (somente para pais vinculados)</li>
              <li><strong className="text-white/80">Painel do professor:</strong> acompanhar alunos da turma</li>
              <li><strong className="text-white/80">Melhorar o produto:</strong> analytics anonimizados de uso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">4. Protecao de Menores</h2>
            <p>O Studdo segue as diretrizes do ECA e da LGPD para protecao de dados de criancas e adolescentes:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Menores de 12 anos devem ter cadastro realizado por um responsavel</li>
              <li>O conteudo gerado pela IA e filtrado para ser adequado a faixa etaria</li>
              <li>Nao exibimos publicidade ou anuncios</li>
              <li>Nao compartilhamos dados de menores com terceiros para fins comerciais</li>
              <li>Pais podem solicitar exclusao dos dados do filho a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">5. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados apenas com:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-white/80">Supabase:</strong> infraestrutura de banco de dados e autenticacao (servidores nos EUA)</li>
              <li><strong className="text-white/80">Google Gemini:</strong> processamento de mensagens do tutor IA (as mensagens sao enviadas para gerar respostas, sem armazenamento permanente pela Google)</li>
              <li><strong className="text-white/80">Railway:</strong> hospedagem da aplicacao</li>
            </ul>
            <p className="mt-2">Nao vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">6. Armazenamento e Seguranca</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados armazenados em banco PostgreSQL com criptografia em repouso</li>
              <li>Comunicacao via HTTPS (TLS 1.3)</li>
              <li>Row Level Security (RLS) — cada usuario so acessa seus proprios dados</li>
              <li>Senhas hasheadas com bcrypt (nunca armazenadas em texto plano)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">7. Seus Direitos (LGPD)</h2>
            <p>Voce tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusao da sua conta e dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados</li>
            </ul>
            <p className="mt-2">Para exercer esses direitos, entre em contato pelo formulario em <Link href="/escolas#contato" className="text-purple-400 hover:text-purple-300">studdo.com.br/escolas</Link>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">8. Cookies</h2>
            <p>Utilizamos cookies essenciais para manter sua sessao de login ativa. Nao utilizamos cookies de rastreamento ou publicidade.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">9. Alteracoes nesta Politica</h2>
            <p>Podemos atualizar esta politica periodicamente. Alteracoes significativas serao comunicadas por email ou notificacao na plataforma.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-2">10. Contato do Encarregado (DPO)</h2>
            <p>Para questoes relacionadas a privacidade e protecao de dados, entre em contato pelo formulario em <Link href="/escolas#contato" className="text-purple-400 hover:text-purple-300">studdo.com.br/escolas</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
