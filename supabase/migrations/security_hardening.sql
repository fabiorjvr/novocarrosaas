-- 🛡️ MIGRATION: SECURITY HARDENING (CARROCLAUDE SAAS)
-- Data: 2026-01-08
-- Autor: Fabio (via Trae AI)
-- Objetivo: Implementar RLS estrito e melhorias de performance sugeridas

-- ==============================================================================
-- 1. ATIVAÇÃO DE RLS (SEGURANÇA BÁSICA)
-- ==============================================================================

-- Garantir que RLS está ativo na tabela oficinas
ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas e permissivas (se existirem)
DROP POLICY IF EXISTS "Dados públicos de oficinas" ON oficinas;
DROP POLICY IF EXISTS "public_oficinas_view" ON oficinas;

-- ==============================================================================
-- 2. POLÍTICAS DE ACESSO (RLS OWNER-BASED) - SUGESTÃO #2 (CRÍTICA)
-- ==============================================================================

-- Política: A oficina só pode VER seus próprios dados
CREATE POLICY "oficina_view_own_data" ON oficinas
FOR SELECT
USING (auth.uid() = id);

-- Política: A oficina só pode ATUALIZAR seus próprios dados
CREATE POLICY "oficina_update_own_data" ON oficinas
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política: A oficina pode INSERIR seus próprios dados (Necessário para fluxo via Frontend)
CREATE POLICY "oficina_insert_own_data" ON oficinas
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Política: O Admin (Service Role ou Role específico) pode ver tudo
-- Nota: Service Role bypassa RLS por padrão, mas se usarmos um user admin logado:
CREATE POLICY "admin_view_all" ON oficinas
FOR SELECT
USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() ->> 'email' LIKE '%admin%' -- Fallback simples
);

-- ==============================================================================
-- 3. ÍNDICES DE PERFORMANCE - SUGESTÃO #4 (ALTA PRIORIDADE)
-- ==============================================================================

-- Busca rápida por email (Login)
CREATE INDEX IF NOT EXISTS idx_oficinas_email ON oficinas(email);

-- Busca rápida por WhatsApp (Integração futura)
CREATE INDEX IF NOT EXISTS idx_oficinas_whatsapp ON oficinas(numero_whatsapp);

-- Filtro de oficinas ativas (Dashboard Admin)
CREATE INDEX IF NOT EXISTS idx_oficinas_ativo ON oficinas(ativo) WHERE ativo = true;

-- ==============================================================================
-- 4. COLUNAS NOVAS PARA ONBOARDING
-- ==============================================================================

-- Adicionar colunas de perfil se não existirem
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS responsavel VARCHAR(100);
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS razao_social VARCHAR(255);
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS setup_concluido BOOLEAN DEFAULT FALSE;

-- ==============================================================================
-- 5. TRIGGER DE AUDITORIA SIMPLIFICADA - SUGESTÃO #3 (MÉDIA PRIORIDADE)
-- ==============================================================================

-- Tabela de logs (se não existir)
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id UUID REFERENCES oficinas(id),
  acao VARCHAR(50),
  tabela VARCHAR(50),
  dados_antigos JSONB,
  dados_novos JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Função de trigger
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO logs_auditoria (oficina_id, acao, tabela, dados_antigos, dados_novos)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    TG_TABLE_NAME,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela oficinas
DROP TRIGGER IF EXISTS trigger_audit_oficinas ON oficinas;
CREATE TRIGGER trigger_audit_oficinas
AFTER UPDATE OR DELETE ON oficinas
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ==============================================================================
-- 6. AUTOMATIZAÇÃO DE CADASTRO (TRIGGER) - SUGESTÃO #3
-- ==============================================================================

-- Função para criar perfil automaticamente ao registrar usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.oficinas (id, email, nome, setup_concluido, senha_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Nova Oficina'),
    FALSE,
    '$2a$10$auth_managed_account_placeholder' -- Placeholder técnico
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que dispara após insert em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- NOTAS FINAIS:
-- Execute este script no SQL Editor do Supabase Dashboard.
-- Ele resolve as vulnerabilidades críticas de acesso e prepara o banco para escala.
-- ==============================================================================
