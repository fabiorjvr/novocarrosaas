# ✅ CHECKLIST - IMPLEMENTAÇÃO GOOGLE OAUTH

## 📊 PROGRESSO GERAL
**Status:** 50% Concluído
**Bloqueador Crítico:** Chaves Supabase incorretas

---

## 🔐 CONFIGURAÇÃO SUPABASE
- [x] Atualizar .env com novas credenciais
- [x] Atualizar .env.local com novas credenciais
- [x] Criar schema inicial do banco
- [x] Aplicar security hardening (RLS, índices)
- [x] Criar tabelas necessárias
- [ ] **OBTER CHAVES CORRETAS DO SUPABASE** 🔴 CRÍTICO
  - URL: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api
  - Copiar: anon public e service_role secret
  - Atualizar: .env e .env.local
- [ ] Testar conexão com chaves corretas

---

## 🔧 CONFIGURAÇÃO GOOGLE CLOUD
- [ ] Criar projeto "novocarrosaas" no Google Cloud
- [ ] Configurar tela de consentimento OAuth
  - URL: https://console.cloud.google.com/apis/credentials/consent?project=novocarrosaas
  - Tipo: Externo
  - Nome: Novo Carrosaas
  - Email: fabiorjvr@gmail.com
- [ ] Criar credenciais OAuth 2.0
  - URL: https://console.cloud.google.com/apis/credentials?project=novocarrosaas
  - Tipo: Aplicação da Web
  - Origens JavaScript:
    - http://localhost:3000
    - https://novocarrosaas.vercel.app
    - https://nrlvchnkplruprpskclg.supabase.co
  - URIs redirecionamento:
    - http://localhost:3000/auth/callback
    - https://nrlvchnkplruprpskclg.supabase.co/auth/v1/callback
    - https://novocarrosaas.vercel.app/auth/callback
- [ ] Copiar Client ID e Client Secret

---

## 🌐 CONFIGURAÇÃO SUPABASE GOOGLE PROVIDER
- [ ] Habilitar Google Auth no Supabase
  - URL: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/providers?provider=Google
  - Toggle: Ativado
- [ ] Configurar Client ID e Secret
  - Cole ID do Cliente do Google
  - Cole Segredo do Cliente do Google
- [ ] Configurar opções adicionais
  - [x] Skip nonce checks
  - [x] Allow users without an email
- [ ] Salvar configurações

---

## 📝 ATUALIZAÇÃO VARIÁVEIS DE AMBIENTE
- [x] Criar rota de callback (app/auth/callback/route.ts)
- [ ] Adicionar Google OAuth ao .env
  ```env
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=[ID_CLIENTE_GOOGLE]
  GOOGLE_CLIENT_SECRET=[SECRETO_CLIENTE_GOOGLE]
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- [ ] Adicionar Google OAuth ao .env.local
  ```env
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=[ID_CLIENTE_GOOGLE]
  GOOGLE_CLIENT_SECRET=[SECRETO_CLIENTE_GOOGLE]
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

---

## 👥 CRIAÇÃO DE USUÁRIOS DE TESTE
- [ ] **Criar usuários no Supabase Dashboard** (Opção Recomendada)
  - URL: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/users
  - Clique em "Add user"
  - Criar 5 usuários:
    - contato@bahiaoficina.com
    - contato@maceiooficina.com
    - contato@minasoficina.com
    - contato@paranaoficina.com
    - contato@spoficina.com
- [ ] Opcional: Criar via script (após corrigir chaves)
  - Executar: npx ts-node scripts/create-auth-users.ts
- [ ] Opcional: Criar via registro na app
  - Acessar: http://localhost:3000/register
  - Criar contas manualmente

---

## 🗄️  POPULAR BANCO DE DADOS
- [ ] Executar sync-and-seed
  ```bash
  npx ts-node scripts/sync-and-seed.ts
  ```
- [ ] Verificar dados criados:
  - [x] Oficinas criadas
  - [ ] Clientes criados
  - [ ] Serviços criados
  - [x] Tipos de serviço inseridos

---

## 🚀 CONFIGURAÇÃO VERCEL
- [ ] Adicionar variáveis de ambiente no Vercel
  - URL: https://vercel.com/dashboard
  - Projeto: novocarrosaas
  - Settings → Environment Variables
- [ ] Adicionar (ou atualizar):
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - NEXT_PUBLIC_APP_URL (produção: https://novocarrosaas.vercel.app)
- [ ] Fazer deploy
  ```bash
  git add .
  git commit -m "chore: atualizar credenciais Google OAuth"
  git push origin main
  ```

---

## 🧪 TESTES

### Testes Locais (http://localhost:3000)
- [ ] Iniciar servidor: npm run dev
- [ ] Testar login com email/senha
  - Acessar: http://localhost:3000/login
  - Login: contato@spoficina.com
  - Senha: (definida na criação)
- [ ] Testar registro com email/senha
  - Acessar: http://localhost:3000/register
  - Criar nova conta
  - Verificar email de confirmação
- [ ] Testar login com Google
  - Acessar: http://localhost:3000/login
  - Clicar em "Google"
  - Aceitar consentimento
  - Verificar redirecionamento

### Testes de Produção (https://novocarrosaas.vercel.app)
- [ ] Testar login com email/senha
- [ ] Testar registro com email/senha
- [ ] Testar login com Google
- [ ] Verificar dados no Supabase Dashboard
- [ ] Verificar logs no Vercel Dashboard

---

## 🔧 MANUTENÇÃO

### Reabilitar Triggers (Opcional)
- [ ] Reabilitar trigger de auditoria
  - Executar scripts/enable-audit-trigger.ts
- [ ] Reabilitar trigger de auth
  - Executar scripts/enable-auth-trigger.ts

### Verificações de Saúde
- [ ] Testar conexão: node scripts/check-health.js
- [ ] Diagnosticar banco: npx ts-node scripts/diagnose-db.ts
- [ ] Verificar RLS: npx ts-node scripts/check-rls.ts

---

## 📌 TAREFAS CONCLUÍDAS

### Infraestrutura do Banco
- [x] Schema inicial criado
- [x] Tabelas criadas
- [x] Índices criados
- [x] RLS configurado
- [x] Triggers configurados (alguns desabilitados)
- [x] Tipos de serviço inseridos

### Frontend
- [x] Página de login com botão Google
- [x] Página de registro com botão Google
- [x] Rota de callback OAuth criada
- [x] Integração com Supabase Auth

### Scripts
- [x] init-schema.ts (criar schema)
- [x] clean-all.ts (limpar banco)
- [x] disable-trigger.ts (desabilitar trigger)
- [x] disable-auth-trigger.ts (desabilitar trigger auth)
- [x] create-auth-users.ts (criar usuários auth)
- [x] sync-and-seed.ts (sincronizar e popular banco)
- [x] diagnose-db.ts (diagnóstico do banco)
- [x] check-oficinas.ts (verificar oficinas)
- [x] test-sql-insert.ts (teste inserção SQL)
- [x] fix-logs-table.ts (corrigir tabela logs)

---

## 🐛 PROBLEMAS CONHECIDOS

### ❌ Chaves de API Supabase Inválidas (CRÍTICO)
- **Problema:** Chaves no formato sb_publishable_* retornam "Invalid API key"
- **Impacto:** Bloqueia todas as operações de autenticação
- **Solução:** Obter chaves corretas do Supabase Dashboard
- **URL:** https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api
- **Status:** AGUARDANDO USUÁRIO

### ⚠️  Triggers Desabilitados
- **Problema:** trigger_audit_oficinas e on_auth_user_created desabilitados
- **Impacto:** Sem auditoria de mudanças e criação automática de perfil
- **Solução:** Reabilitar após resolver problemas de chaves
- **Status:** TEMPORÁRIO

---

## 📊 MÉTRICAS

- ✅ Tarefas Concluídas: 20/40 (50%)
- ❌ Tarefas Pendentes: 20/40 (50%)
- 🔴 Bloqueadores Críticos: 1 (chaves Supabase)
- ⚠️  Bloqueadores Médios: 0
- ⚠️  Bloqueadores Baixos: 0

---

## 🎯 PRÓXIMA AÇÃO

**IMEDIATA:** Obter chaves Supabase corretas do Dashboard
**URL:** https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api

**DEPOIS:** Criar usuários de teste no Supabase Dashboard

---

**Última atualização:** 12/01/2026 às 14:30
**Status:** Aguardando chaves corretas para prosseguir
