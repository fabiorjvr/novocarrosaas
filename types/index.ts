export interface Oficina {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
}

export interface Cliente {
  id: string;
  created_at: string;
  oficina_id: string;
  nome: string;
  telefone: string;
  carro_modelo: string;
  carro_ano: number;
  placa?: string;
  km_media_mensal: number;
}

export interface Servico {
  id: string;
  created_at: string;
  oficina_id: string;
  cliente_id: string;
  tipo_servico: string;
  data_servico: string;
  km_realizado: number;
  valor: number;
  observacoes?: string;
  proxima_revisao_km: number;
  proxima_revisao_data: string;
}

export interface MensagemWhatsapp {
  id: string;
  created_at: string;
  oficina_id: string;
  cliente_id: string;
  tipo: 'LEMBRETE' | 'PROMOCAO' | 'MANUAL';
  conteudo: string;
  status: 'PENDENTE' | 'ENVIADA' | 'FALHA';
  agendada_para?: string;
  data_envio?: string;
}

export interface ConfiguracaoOficina {
  id: string;
  oficina_id: string;
  chave_pix?: string;
  mensagem_padrao_lembrete?: string;
}

// Interface para o Auth State (Frontend)
export interface User {
  id: string;
  email: string;
  nome?: string;
  oficina_id?: string;
  role?: string;
}
