-- 🏗️ MIGRATION: SCHEMA INICIAL (CARROCLAUDE SAAS)
-- Data: 2026-01-12
-- Objetivo: Criar estrutura inicial do banco de dados

-- ==============================================================================
-- 1. TABELA OFICINAS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS oficinas (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255),
  numero_whatsapp VARCHAR(20),
  plano VARCHAR(50) DEFAULT 'free',
  ativo BOOLEAN DEFAULT TRUE,
  cnpj VARCHAR(20),
  telefone VARCHAR(20),
  endereco TEXT,
  responsavel VARCHAR(100),
  razao_social VARCHAR(255),
  setup_concluido BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABELA CLIENTES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20),
  carro VARCHAR(100),
  ano_carro INTEGER,
  placa VARCHAR(20),
  km_carro INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABELA SERVIÇOS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_servico VARCHAR(255) NOT NULL,
  data_servico TIMESTAMPTZ NOT NULL,
  km_na_data INTEGER,
  valor DECIMAL(10, 2),
  descricao TEXT,
  proxima_manutencao_km INTEGER,
  proxima_manutencao_dias INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABELA TIPOS DE SERVIÇO
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tipos_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco_medio DECIMAL(10, 2),
  km_recomendado INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABELA MENSAgens WHATSAPP
-- ==============================================================================

CREATE TABLE IF NOT EXISTS mensagens_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  telefone VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  direcao VARCHAR(10) DEFAULT 'saida',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABELA NOTIFICAÇÕES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABELA LOGS DE AUDITORIA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID REFERENCES oficinas(id) ON DELETE SET NULL,
  acao VARCHAR(50),
  tabela VARCHAR(50),
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario_id UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ÍNDICES INICIAIS
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_clientes_oficina_id ON clientes(oficina_id);
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp ON clientes(whatsapp);
CREATE INDEX IF NOT EXISTS idx_servicos_oficina_id ON servicos(oficina_id);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente_id ON servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_data ON servicos(data_servico);
CREATE INDEX IF NOT EXISTS idx_mensagens_oficina_id ON mensagens_whatsapp(oficina_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON mensagens_whatsapp(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_oficina_id ON notificacoes(oficina_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- ==============================================================================
-- 9. INSERIR TIPOS DE SERVIÇO INICIAIS
-- ==============================================================================

INSERT INTO tipos_servico (nome, descricao, preco_medio, km_recomendado) VALUES
  ('Troca de Óleo', 'Troca completa de óleo do motor e filtros', 250.00, 10000),
  ('Revisão Geral', 'Verificação completa de todos os sistemas do veículo', 800.00, 10000),
  ('Alinhamento e Balanceamento', 'Ajuste da geometria das rodas e balanceamento', 150.00, 5000),
  ('Troca de Pastilhas', 'Substituição das pastilhas de freio', 400.00, 30000),
  ('Limpeza de Ar Condicionado', 'Limpeza completa do sistema de ar condicionado', 180.00, 15000),
  ('Troca de Correia Dentada', 'Substituição da correia dentada e tensor', 600.00, 60000),
  ('Troca de Bateria', 'Substituição da bateria do veículo', 450.00, 36000),
  ('Verificação de Freios', 'Verificação completa do sistema de freios', 120.00, 10000)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 10. ATIVAR RLS INICIAL (SERÁ CONFIGURADO PELO SECURITY_HARDENING)
-- ==============================================================================

ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- FIM DO SCHEMA INICIAL
-- ==============================================================================
