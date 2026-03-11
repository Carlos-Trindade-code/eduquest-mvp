import type { AgeGroup, RecommendedActivity } from '@/lib/auth/types';

/**
 * Atividades recomendadas para pais baseadas em:
 * 1. Matéria com dificuldade
 * 2. Faixa etária
 *
 * Cada atividade é algo SIMPLES que os pais podem fazer em casa
 * para reforçar o aprendizado de forma natural e prazerosa.
 */

export const subjectActivities: RecommendedActivity[] = [
  // MATEMÁTICA
  {
    id: 'math_games',
    subject: 'math',
    activity: 'Jogar Mancala, xadrez ou Sudoku juntos',
    benefit: 'Raciocínio lógico em contexto lúdico — sem pressão de "estudar"',
    age_groups: ['7-9', '10-12', '13-15'],
  },
  {
    id: 'math_cooking',
    subject: 'math',
    activity: 'Cozinhar juntos e pedir para dobrar/metade da receita',
    benefit: 'Frações e proporções de forma prática e gostosa',
    age_groups: ['4-6', '7-9', '10-12'],
  },
  {
    id: 'math_shopping',
    subject: 'math',
    activity: 'No mercado, pedir para calcular troco ou comparar preços por kg',
    benefit: 'Aritmética aplicada ao mundo real — torna o conteúdo relevante',
    age_groups: ['7-9', '10-12', '13-15'],
  },
  {
    id: 'math_building',
    subject: 'math',
    activity: 'Brincar de construir com blocos ou LEGO seguindo padrões',
    benefit: 'Geometria espacial, sequências e padrões de forma sensorial',
    age_groups: ['4-6', '7-9'],
  },

  // PORTUGUÊS
  {
    id: 'pt_reading',
    subject: 'portuguese',
    activity: '10 minutos de leitura compartilhada antes de dormir',
    benefit: 'Vocabulário, fluência leitora e vínculo afetivo',
    age_groups: ['4-6', '7-9', '10-12'],
  },
  {
    id: 'pt_diary',
    subject: 'portuguese',
    activity: 'Diário semanal: pais perguntam sobre a semana, filho escreve',
    benefit: 'Prática de escrita com propósito real — não é "dever extra"',
    age_groups: ['7-9', '10-12', '13-15'],
  },
  {
    id: 'pt_storytelling',
    subject: 'portuguese',
    activity: 'Criar uma história juntos, cada um conta um trecho',
    benefit: 'Criatividade narrativa, coesão textual e diversão',
    age_groups: ['4-6', '7-9', '10-12'],
  },
  {
    id: 'pt_news',
    subject: 'portuguese',
    activity: 'Ler uma notícia juntos e discutir o ponto de vista do autor',
    benefit: 'Interpretação de texto e pensamento crítico',
    age_groups: ['13-15', '16-18'],
  },

  // CIÊNCIAS
  {
    id: 'sci_experiments',
    subject: 'science',
    activity: 'Experimentos caseiros: vulcão de bicarbonato, slime, cristais',
    benefit: 'Ciências de forma sensorial e memorável — aprende fazendo',
    age_groups: ['4-6', '7-9', '10-12'],
  },
  {
    id: 'sci_nature',
    subject: 'science',
    activity: 'Passeio ao ar livre identificando plantas, insetos ou rochas',
    benefit: 'Observação científica natural — a criança vira "pesquisadora"',
    age_groups: ['4-6', '7-9', '10-12'],
  },
  {
    id: 'sci_documentary',
    subject: 'science',
    activity: 'Assistir documentário curto (15-20 min) e discutir depois',
    benefit: 'Contextualização visual + debate fortalece a retenção',
    age_groups: ['10-12', '13-15', '16-18'],
  },

  // HISTÓRIA / GEOGRAFIA
  {
    id: 'hist_documentary',
    subject: 'history',
    activity: 'Assistir documentário e discutir "por que isso aconteceu?"',
    benefit: 'Contextualização e pensamento crítico sobre causa-efeito',
    age_groups: ['10-12', '13-15', '16-18'],
  },
  {
    id: 'hist_family',
    subject: 'history',
    activity: 'Contar histórias da família e comparar com eventos históricos',
    benefit: 'Conexão pessoal com a história — torna o conteúdo relevante',
    age_groups: ['7-9', '10-12', '13-15'],
  },
  {
    id: 'geo_maps',
    subject: 'geography',
    activity: 'Planejar uma "viagem imaginária" usando mapas e pesquisa',
    benefit: 'Geografia aplicada, cultura e curiosidade sobre o mundo',
    age_groups: ['7-9', '10-12', '13-15'],
  },

  // INGLÊS
  {
    id: 'eng_games',
    subject: 'english',
    activity: 'Mudar idioma do jogo/app que a criança já usa para inglês',
    benefit: 'Imersão orgânica sem pressão — aprende no contexto do que gosta',
    age_groups: ['7-9', '10-12', '13-15'],
  },
  {
    id: 'eng_music',
    subject: 'english',
    activity: 'Ouvir música em inglês e tentar traduzir a letra juntos',
    benefit: 'Vocabulário + pronúncia de forma divertida e cultural',
    age_groups: ['10-12', '13-15', '16-18'],
  },
  {
    id: 'eng_labels',
    subject: 'english',
    activity: 'Colar post-its com nomes em inglês nos objetos da casa',
    benefit: 'Associação visual direta — vocabulário do cotidiano',
    age_groups: ['4-6', '7-9'],
  },
];

// Extracurricular activities by age
export const extracurricularByAge: Record<AgeGroup, string[]> = {
  '4-6': [
    'Teatro e improviso — desenvolve expressão e confiança',
    'Esportes em equipe — cooperação e movimento',
    'Culinária simples — seguir instruções e criar',
    'Contato com natureza — exploração e curiosidade',
  ],
  '7-9': [
    'Robótica / Scratch — pensamento computacional',
    'Instrumento musical — disciplina e criatividade',
    'Xadrez — estratégia e paciência',
    'Clube de ciências — experimentação',
  ],
  '10-12': [
    'Robótica / programação — lógica e resolução de problemas',
    'Instrumento musical — persistência e expressão',
    'Olimpíadas escolares — desafio saudável',
    'Esportes individuais — autoconhecimento',
  ],
  '13-15': [
    'Yoga ou meditação — gestão de ansiedade',
    'Debate / grêmio — argumentação e cidadania',
    'Voluntariado — empatia e propósito',
    'Esportes de raquete — foco e controle',
  ],
  '16-18': [
    'Iniciação científica — preparação acadêmica',
    'Empreendedorismo jovem — autonomia e visão',
    'Cursos online certificados — portfólio',
    'Mentoria por profissionais da área de interesse',
  ],
};

export function getActivitiesForSubject(
  subject: string,
  ageGroup: AgeGroup
): RecommendedActivity[] {
  return subjectActivities.filter(
    (a) => a.subject === subject && a.age_groups.includes(ageGroup)
  );
}

export function getExtracurriculars(ageGroup: AgeGroup): string[] {
  return extracurricularByAge[ageGroup] || [];
}
