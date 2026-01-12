import axios from 'axios';
import { Cliente, Servico } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function gerarMensagemIA(cliente: Cliente, servico: Servico, tipo: string) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY não configurada');

  const prompt = `
    Atue como uma assistente virtual de oficina mecânica chamada "Assistente Oficina".
    Gere uma mensagem de WhatsApp curta, cordial e persuasiva para o cliente ${cliente.nome}.
    
    Contexto:
    - Veículo: ${cliente.carro_modelo} (${cliente.carro_ano})
    - Último serviço: ${servico.tipo_servico} em ${new Date(servico.data_servico).toLocaleDateString('pt-BR')}
    - Motivo do contato: ${tipo} (Lembrete de manutenção preventiva ou Promoção)
    
    A mensagem deve convidar para agendar uma revisão. Use emojis. Não invente preços.
  `;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0]?.message?.content || 'Erro ao gerar mensagem.';
  } catch (error) {
    console.error('Erro na IA:', error);
    return 'Olá! Passando para lembrar da revisão do seu carro. Podemos agendar?';
  }
}
