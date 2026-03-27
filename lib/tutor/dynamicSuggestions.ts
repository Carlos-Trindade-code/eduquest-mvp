// lib/tutor/dynamicSuggestions.ts
// Generates contextual quick-reply suggestions based on the tutor's last message.

/**
 * Analyse the last assistant message and return 2-3 quick reply pills.
 * Returns an empty array when the message does NOT end with a question.
 */
export function generateDynamicSuggestions(assistantMessage: string): string[] {
  const trimmed = assistantMessage.trim();

  // Only trigger when the tutor asks something
  if (!trimmed.endsWith('?')) return [];

  const lower = trimmed.toLowerCase();

  // --- Pattern: "do you understand?" / "entendeu?" / "ficou claro?" ---
  if (
    lower.includes('entendeu') ||
    lower.includes('ficou claro') ||
    lower.includes('faz sentido') ||
    lower.includes('compreendeu') ||
    lower.includes('entendido')
  ) {
    return [
      'Sim, entendi!',
      'Pode explicar de outro jeito?',
      'Pode dar um exemplo?',
    ];
  }

  // --- Pattern: asking which aspect / topic ---
  if (
    lower.includes('qual aspecto') ||
    lower.includes('qual tópico') ||
    lower.includes('qual tema') ||
    lower.includes('qual parte') ||
    lower.includes('que parte') ||
    lower.includes('o que quer') ||
    lower.includes('por onde') ||
    lower.includes('qual desses') ||
    lower.includes('qual dessas')
  ) {
    return [
      'O primeiro que você citou',
      'Pode escolher pra mim?',
      'Quero entender todos!',
    ];
  }

  // --- Pattern: tutor asks a math / science question (numbers, formulas) ---
  if (
    /\d+\s*[\+\-\*\/×÷=]\s*\d+/.test(trimmed) ||
    lower.includes('resultado') ||
    lower.includes('calcul') ||
    lower.includes('quanto') ||
    lower.includes('valor de') ||
    lower.includes('fórmula')
  ) {
    return [
      'Não sei, me dê uma dica',
      'Acho que é...',
      'Pode explicar o passo a passo?',
    ];
  }

  // --- Pattern: yes/no question ---
  if (
    lower.includes('quer tentar') ||
    lower.includes('quer ver') ||
    lower.includes('vamos') ||
    lower.includes('pronto') ||
    lower.includes('bora') ||
    lower.includes('topa')
  ) {
    return ['Sim, vamos!', 'Pode me explicar antes?', 'Tenho uma dúvida'];
  }

  // --- Pattern: "can you try?" / "tenta aí" ---
  if (
    lower.includes('tenta') ||
    lower.includes('consegue') ||
    lower.includes('resolve')
  ) {
    return [
      'Vou tentar!',
      'Não sei, me dê uma dica',
      'Pode fazer junto comigo?',
    ];
  }

  // --- Default: any other question ---
  return ['Pode explicar melhor?', 'Me dê uma dica', 'Sim!'];
}
