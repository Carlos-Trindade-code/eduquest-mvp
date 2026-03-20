// lib/subjects/suggestions.ts
import type { AgeGroup } from '@/lib/auth/types';

const SUGGESTIONS: Record<string, Record<AgeGroup, string[]>> = {
  math: {
    '4-6':   ['Contar até 10', 'Formas geométricas', 'Mais e menos', 'Cores e números'],
    '7-9':   ['Tabuada', 'Frações simples', 'Medidas', 'Problemas de adição'],
    '10-12': ['Frações', 'Geometria', 'Equações', 'Porcentagem'],
    '13-15': ['Álgebra', 'Funções', 'Trigonometria', 'Estatística'],
    '16-18': ['Cálculo', 'Matrizes', 'Números complexos', 'Probabilidade'],
  },
  portuguese: {
    '4-6':   ['Letras do alfabeto', 'Rimas', 'Contar histórias', 'Vogais'],
    '7-9':   ['Leitura', 'Pontuação', 'Substantivos', 'Texto narrativo'],
    '10-12': ['Interpretação de texto', 'Ortografia', 'Verbos', 'Redação'],
    '13-15': ['Literatura brasileira', 'Gramática', 'Argumentação', 'Poesia'],
    '16-18': ['Análise literária', 'Redação ENEM', 'Linguística', 'Figuras de linguagem'],
  },
  history: {
    '4-6':   ['Minha família', 'Ontem e hoje', 'Profissões', 'Festas tradicionais'],
    '7-9':   ['Brasil colonial', 'Indígenas', 'Escravidão', 'Independência'],
    '10-12': ['Revolução Industrial', 'Guerras Mundiais', 'Brasil República', 'Ditadura militar'],
    '13-15': ['Guerra Fria', 'Nazismo', 'Colonialismo', 'Revolução Francesa'],
    '16-18': ['Geopolítica atual', 'Filosofia política', 'Historiografia', 'Revoluções sociais'],
  },
  science: {
    '4-6':   ['Animais', 'Plantas', 'Água', 'Sol e chuva'],
    '7-9':   ['Corpo humano', 'Ecossistemas', 'Estados da matéria', 'Sistema solar'],
    '10-12': ['Célula', 'Fotossíntese', 'Cadeia alimentar', 'Física básica'],
    '13-15': ['Genética', 'Evolução', 'Química orgânica', 'Termodinâmica'],
    '16-18': ['Bioquímica', 'Mecânica quântica', 'Ecologia avançada', 'Microbiologia'],
  },
  geography: {
    '4-6':   ['Minha cidade', 'Países', 'Rios e montanhas', 'Clima'],
    '7-9':   ['Regiões do Brasil', 'Continentes', 'Vegetação', 'Mapas'],
    '10-12': ['Geopolítica', 'Biomas', 'Urbanização', 'Globalização'],
    '13-15': ['Desenvolvimento econômico', 'Conflitos geopolíticos', 'Clima e ambiente', 'Migração'],
    '16-18': ['Geopolítica avançada', 'Sustentabilidade', 'Cartografia', 'Energia'],
  },
  english: {
    '4-6':   ['Cores', 'Animais', 'Números', 'Cumprimentos'],
    '7-9':   ['Presente simples', 'Vocabulário básico', 'Frases do dia a dia', 'Alphabet'],
    '10-12': ['Past tense', 'Present continuous', 'Phrasal verbs', 'Reading'],
    '13-15': ['Grammar advanced', 'Writing essays', 'Listening', 'Speaking'],
    '16-18': ['ENEM inglês', 'Redação em inglês', 'Vocabulário avançado', 'Literatura em inglês'],
  },
  other: {
    '4-6':   ['Pintura', 'Música', 'Corpo humano', 'Natureza'],
    '7-9':   ['Tecnologia', 'Arte', 'Educação física', 'Filosofia básica'],
    '10-12': ['Filosofia', 'Sociologia', 'Arte', 'Empreendedorismo'],
    '13-15': ['Filosofia', 'Sociologia', 'Inglês avançado', 'Empreendedorismo'],
    '16-18': ['Filosofia', 'Sociologia', 'Inglês avançado', 'Inovação'],
  },
};

export function getSuggestions(subject: string, ageGroup: AgeGroup): string[] {
  return SUGGESTIONS[subject]?.[ageGroup] ?? SUGGESTIONS.other[ageGroup];
}
