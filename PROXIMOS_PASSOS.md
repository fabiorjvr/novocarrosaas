# 🎯 PRÓXIMOS PASSOS - AÇÃO IMEDIATA

## 🔴 AÇÃO CRÍTICA - OBRIGATÓRIA PARA PROSSEGUIR

### PASSO 1: Obter Chaves Supabase Corretas (5 minutos)

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api
   ```

2. **Copie as chaves corretas:**
   - Encontre a seção **"Project URL"** → Copie: `https://nrlvchnkplruprpskclg.supabase.co`
   - Encontre a seção **"anon public"** → Copie a chave (deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Encontre a seção **"service_role secret"** → Copie a chave (deve começar com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. **Atualize os arquivos:**
   
   **Arquivo `.env`:**
   ```env
   # Configuração Supabase (Oficina SaaS)
   # URL do Projeto
   NEXT_PUBLIC_SUPABASE_URL=https://nrlvchnkplruprpskclg.supabase.co
   
   # Chave Anônima (Pública - Frontend)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[COLE AQUI A CHAVE ANONIMA]
   
   # Chave de Serviço (Secreta - Backend - NUNCA EXPOR)
   SUPABASE_SERVICE_ROLE_KEY=[COLE AQUI A CHAVE SERVICE_ROLE]
   
   # Senha do Banco de Dados (Para scripts de migração)
   DATABASE_PASSWORD=AbC@123456DefGhI
   
   # Segredos da Aplicação
   JWT_SECRET=oficina-saas-super-secret-key-2026
   GROQ_API_KEY=sua_chave_groq_aqui
   ```
   
   **Arquivo `.env.local`:**
   ```env
   # Configuração Supabase (Oficina SaaS)
   NEXT_PUBLIC_SUPABASE_URL=https://nrlvchnkplruprpskclg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[COLE AQUI A CHAVE ANONIMA]
   SUPABASE_SERVICE_ROLE_KEY=[COLE AQUI A CHAVE SERVICE_ROLE]
   
   # Senha do Banco de Dados (Para scripts de migração)
   DATABASE_PASSWORD=AbC@123456DefGhI
   
   # Segredos da Aplicação
   JWT_SECRET=oficina-saas-super-secret-key-2026
   GROQ_API_KEY=sua_chave_groq_aqui
   
   # Node Environment
   NODE_ENV=development
   ```

4. **Teste a conexão:**
   ```bash
   node scripts/check-health.js
   ```
   
   Se retornar `STATUS: 200`, está tudo certo! ✅

---

## 🟢 PASSO 2: Criar Usuários de Teste (5 minutos)

### Opção A: Via Supabase Dashboard (Recomendada)

1. **Acesse o dashboard de usuários:**
   ```
   https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/users
   ```

2. **Clique em "Add user"** e crie os seguintes usuários:

   | Email | Senha | Nome |
   |-------|--------|------|
   | contato@bahiaoficina.com | password123 | Bahia Oficina |
   | contato@maceiooficina.com | password123 | Maceio Oficina |
   | contato@minasoficina.com | password123 | Minas Gerais Oficina |
   | contato@paranaoficina.com | password123 | Parana Oficina |
   | contato@spoficina.com | password123 | São Paulo Oficina |

3. **Marque a opção "Auto Confirm User"** para cada usuário

### Opção B: Via Script (Após corrigir chaves)

```bash
npx ts-node scripts/create-auth-users.ts
```

### Opção C: Via Registro na App

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000/register
3. Crie as contas manualmente

---

## 🟢 PASSO 3: Popular Banco de Dados (2 minutos)

Após criar os usuários, execute:

```bash
npx ts-node scripts/sync-and-seed.ts
```

Isso vai criar:
- 5 oficinas
- 50 clientes (10 por oficina)
- 100+ serviços (2-3 por cliente)

---

## 🟢 PASSO 4: Testar Aplicação (5 minutos)

### Testar Login com Email/Senha

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse:**
   ```
   http://localhost:3000/login
   ```

3. **Faça login:**
   - Email: contato@spoficina.com
   - Senha: password123

4. **Verifique o redirecionamento:**
   - Deve ir para `/dashboard` (oficina) ou `/admin/dashboard` (admin)

### Testar Registro

1. **Acesse:**
   ```
   http://localhost:3000/register
   ```

2. **Crie uma nova conta:**
   - Nome: Teste Oficina
   - Email: teste@teste.com
   - Senha: teste123

3. **Verifique:**
   - Usuário criado no Supabase Dashboard
   - Perfil criado na tabela `oficinas`

---

## 🔵 PASSO 5: Configurar Google OAuth (30 minutos) - Opcional

Se quiser habilitar login com Google, siga:

### 1. Configurar Google Cloud Console (20 min)

**A. Criar Tela de Consentimento:**
```
URL: https://console.cloud.google.com/apis/credentials/consent?project=novocarrosaas
```
- Tipo: Externo
- Nome: Novo Carrosaas
- Email: fabiorjvr@gmail.com

**B. Criar Credenciais OAuth 2.0:**
```
URL: https://console.cloud.google.com/apis/credentials?project=novocarrosaas
```
- Criar credenciais → ID do cliente OAuth
- Tipo: Aplicação da Web
- Origens JavaScript:
  - http://localhost:3000
  - https://novocarrosaas.vercel.app
  - https://nrlvchnkplruprpskclg.supabase.co
- URIs redirecionamento:
  - http://localhost:3000/auth/callback
  - https://nrlvchnkplruprpskclg.supabase.co/auth/v1/callback
  - https://novocarrosaas.vercel.app/auth/callback

**C. Copiar credenciais:**
- Client ID: Salvar
- Client Secret: Salvar

### 2. Configurar Supabase Google Provider (5 min)

1. **Acesse:**
   ```
   https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/providers?provider=Google
   ```

2. **Configure:**
   - Toggle: Ativado
   - Client ID: [Cole do Google]
   - Client Secret: [Cole do Google]
   - ☑️ Skip nonce checks
   - ☑️ Allow users without an email
   - Clique em "Save"

### 3. Atualizar Variáveis de Ambiente (5 min)

**Arquivos `.env` e `.env.local`:**
```env
# Adicionar ao final:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[ID_CLIENTE_GOOGLE]
GOOGLE_CLIENT_SECRET=[SECRETO_CLIENTE_GOOGLE]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Testar Google Login

1. **Acesse:**
   ```
   http://localhost:3000/login
   ```

2. **Clique em "Google"**
3. **Aceite o consentimento**
4. **Verifique o redirecionamento**

---

## 🟡 PASSO 6: Configurar Vercel (15 minutos) - Para Produção

### 1. Adicionar Variáveis de Ambiente

1. **Acesse:**
   ```
   https://vercel.com/dashboard
   ```

2. **Selecione o projeto:** novocarrosaas

3. **Vá para:** Settings → Environment Variables

4. **Adicione (ou atualize):**
   
   | Nome | Valor | Ambientes |
   |------|-------|-----------|
   | NEXT_PUBLIC_SUPABASE_URL | https://nrlvchnkplruprpskclg.supabase.co | Production, Preview, Development |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | [Chave Anônima] | Production, Preview, Development |
   | SUPABASE_SERVICE_ROLE_KEY | [Chave Service Role] | Production, Preview, Development |
   | NEXT_PUBLIC_GOOGLE_CLIENT_ID | [ID Cliente Google] | Production, Preview, Development |
   | GOOGLE_CLIENT_SECRET | [Segredo Cliente Google] | Production |
   | NEXT_PUBLIC_APP_URL | https://novocarrosaas.vercel.app | Production |
   | NEXT_PUBLIC_APP_URL | http://localhost:3000 | Development |

### 2. Fazer Deploy

```bash
git add .
git commit -m "chore: atualizar credenciais e preparar produção"
git push origin main
```

O Vercel fará o deploy automaticamente.

### 3. Testar Produção

1. **Acesse:**
   ```
   https://novocarrosaas.vercel.app
   ```

2. **Teste:**
   - Login com email/senha
   - Login com Google (se configurado)
   - Registro
   - Dashboard

---

## 📊 RESUMO DE TEMPO

- **Mínimo (Sem Google OAuth):** 12 minutos
- **Completo (Com Google OAuth):** 42 minutos
- **Produção (Com Vercel):** 57 minutos

---

## ✅ CHECKLIST RÁPIDO

### Para Testar Localmente Apenas:
- [ ] Obter chaves Supabase corretas
- [ ] Atualizar .env e .env.local
- [ ] Criar 5 usuários no Supabase Dashboard
- [ ] Executar sync-and-seed
- [ ] Testar login em http://localhost:3000/login

### Para Google OAuth:
- [ ] + Configurar Google Cloud
- [ ] + Configurar Supabase Google Provider
- [ ] + Atualizar variáveis de ambiente
- [ ] + Testar login com Google

### Para Produção:
- [ ] + Configurar Vercel
- [ ] + Fazer deploy
- [ ] + Testar em produção

---

## 🆘 PRECISA DE AJUDA?

### Problemas Comuns:

**Erro: "Invalid API key"**
- Solução: Obter chaves corretas do Supabase Dashboard
- URL: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api

**Erro: "Auth user não encontrado"**
- Solução: Criar usuários no Supabase Dashboard
- URL: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/users

**Login não funciona com Google**
- Solução: Verificar se Google Cloud e Supabase estão configurados
- URLs:
  - Google: https://console.cloud.google.com/apis/credentials?project=novocarrosaas
  - Supabase: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/providers

### Links Úteis:
- Supabase Dashboard: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg
- Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=novocarrosaas
- Vercel Dashboard: https://vercel.com/dashboard

---

**Pronto para começar? Comece pelo PASSO 1!** 🚀
