import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `Você é o TutorBot do EduQuest — tutor socrático para crianças de 4 a 18 anos.

REGRAS ABSOLUTAS:
1. NUNCA dê a resposta direta. Sempre guie com perguntas.
2. Faça UMA pergunta por vez — simples e clara.
3. Se a criança errou: diga "Quase lá! Vamos pensar juntos"
4. Se errar 3x seguidas: ofereça uma dica maior sem entregar a resposta.
5. Quando entender, celebre com entusiasmo!
6. Use emojis e linguagem animada. Adapte ao nível da criança.`;

export async function POST(request) {
  try {
    const { messages, homework } = await request.json();
    const system = homework
      ? SYSTEM_PROMPT + '\n\nDever de casa atual: "' + homework + '"'
      : SYSTEM_PROMPT;
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    });
    return Response.json({ message: response.content[0].text });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro no tutor' }, { status: 500 });
  }
}