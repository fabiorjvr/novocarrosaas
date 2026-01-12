 GUIA COMPLETO DE CONFIGURAÇÃO - NOVO CARROSAAS COM GOOGLE OAUTH
📋 INFORMAÇÕES DO PROJETO
Projeto Principal:

text
Nome do Projeto: Novo Carrosaas (novocarrosaas)
Repositório GitHub: https://github.com/fabiorjvr/novocarrosaas
Credenciais Supabase:

text
ID do Projeto Supabase: nrlvchnkplruprpskclg
URL Supabase: https://nrlvchnkplruprpskclg.supabase.co
Região: Padrão
Google Cloud:

text
Projeto Google Cloud: novocarrosaas
ID do Projeto: [será fornecido após criação]
Email de Suporte: fabiorjvr@gmail.com
🔐 URLS E CALLBACKS ESSENCIAIS
URL de Callback OAuth (Supabase):

text
https://nrlvchnkplruprpskclg.supabase.co/auth/v1/callback
URLs Adicionais para Diferentes Ambientes:

Desenvolvimento Local:

text
http://localhost:3000/auth/callback
http://localhost:3000/
Produção Vercel:

text
https://novocarrosaas.vercel.app/auth/callback
https://novocarrosaas.vercel.app/
Alternativas (se mudar de domínio):

text
https://seu-dominio.com/auth/callback
https://seu-dominio.com/
✅ PASSO 1: CONFIGURAR TELA DE CONSENTIMENTO OAUTH
Acesso
Vá para: https://console.cloud.google.com/apis/credentials/consent?project=novocarrosaas

Clique em "Criar tela de consentimento"

Preenchimento do Formulário
Tipo de Usuário:

Selecione: Externo (para qualquer usuário com Google)

Informações do Aplicativo (Etapa 1):

text
Nome do App: Novo Carrosaas
E-mail para suporte do usuário: fabiorjvr@gmail.com
Público-Alvo (Etapa 2):

Selecione: Externo

Descrição: "Aplicativo de gerenciamento de carros com autenticação Google"

Dados de Contato (Etapa 3):

text
E-mail para contato: fabiorjvr@gmail.com
Escopos (Etapa 4):

Manter padrões (email, perfil, etc.)

Adicionar se necessário: userinfo.email, userinfo.profile

Clique em "Criar"

🔑 PASSO 2: CRIAR CREDENCIAIS OAUTH 2.0
Acesso e Criação
Vá para: https://console.cloud.google.com/apis/credentials?project=novocarrosaas

Clique em "Criar credenciais" → "ID do cliente OAuth"

Selecione tipo: Aplicação da Web

Configuração das Credenciais
Nome da Credencial:

text
Novo Carrosaas Web
URIs Autorizadas (IMPORTANTE - Adicionar TODOS):

text
Origens de JavaScript autorizadas:
- http://localhost:3000
- https://novocarrosaas.vercel.app
- https://nrlvchnkplruprpskclg.supabase.co

URIs de redirecionamento autorizadas:
- http://localhost:3000/auth/callback
- https://nrlvchnkplruprpskclg.supabase.co/auth/v1/callback
- https://novocarrosaas.vercel.app/auth/callback
- https://novocarrosaas.vercel.app/
Copiar Credenciais
Após clicar em "Criar", você receberá um popup com:

text
ID do Cliente: [COPIE ESTE VALOR]
Segredo do Cliente: [COPIE ESTE VALOR]
Salve em local seguro!

🔧 PASSO 3: ATUALIZAR SUPABASE
Acesso ao Supabase
Vá para: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/providers?provider=Google

Ou navegue por: Dashboard → Authentication → Providers → Google

Preenchimento
Habilitar Sign-in com Google:

Toggle: Ativado (verde)

Campos a Preencher:

text
Client IDs:
[Cole aqui o ID do Cliente do Google]

Client Secret (para OAuth):
[Cole aqui o Segredo do Cliente do Google]
Opções Adicionais (Recomendado):

☑️ Skip nonce checks (Aceitar tokens ID com qualquer nonce)

☑️ Allow users without an email (Permitir usuários sem email)

Clique em "Save"

🌐 PASSO 4: ATUALIZAR ARQUIVO .ENV
Variáveis de Ambiente - Supabase
Arquivo .env.local (Desenvolvimento):

bash
# Supabase - Novo Carrosaas
NEXT_PUBLIC_SUPABASE_URL=https://nrlvchnkplruprpskclg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anonima-aqui]
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role-aqui]

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[ID do Cliente do Google]
GOOGLE_CLIENT_SECRET=[Segredo do Cliente do Google]

# URL da Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
Variáveis para .env.production (Vercel):

bash
# Supabase - Novo Carrosaas
NEXT_PUBLIC_SUPABASE_URL=https://nrlvchnkplruprpskclg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anonima-aqui]
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role-aqui]

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[ID do Cliente do Google]
GOOGLE_CLIENT_SECRET=[Segredo do Cliente do Google]

# URL da Aplicação
NEXT_PUBLIC_APP_URL=https://novocarrosaas.vercel.app
Obter Chaves do Supabase
Vá para: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api

Copie:

Project URL → NEXT_PUBLIC_SUPABASE_URL

anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY

service_role secret → SUPABASE_SERVICE_ROLE_KEY

🚀 PASSO 5: ATUALIZAR VERCEL
Adicionar Variáveis de Ambiente
Vá para: https://vercel.com/dashboard

Selecione projeto: novocarrosaas

Settings → Environment Variables

Adicione (ou atualize):

text
Nome: NEXT_PUBLIC_SUPABASE_URL
Valor: https://nrlvchnkplruprpskclg.supabase.co
Ambientes: Production, Preview, Development

Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valor: [sua-chave-anonima]
Ambientes: Production, Preview, Development

Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: [sua-chave-service-role]
Ambientes: Production, Preview, Development

Nome: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Valor: [ID do Cliente do Google]
Ambientes: Production, Preview, Development

Nome: GOOGLE_CLIENT_SECRET
Valor: [Segredo do Cliente do Google]
Ambientes: Production

Nome: NEXT_PUBLIC_APP_URL
Valor: https://novocarrosaas.vercel.app
Ambientes: Production
Fazer Deploy
bash
git add .
git commit -m "chore: atualizar credenciais Google OAuth"
git push origin main
Vercel fará o deploy automaticamente.

🧪 PASSO 6: TESTAR GOOGLE LOGIN
Teste Local
bash
# 1. Instale dependências
npm install
# ou
yarn install

# 2. Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev

# 3. Abra http://localhost:3000
# 4. Clique em "Entrar com Google"
# 5. Confirme o login com sua conta Google
Teste em Produção
Acesse: https://novocarrosaas.vercel.app

Clique em "Entrar com Google"

Confirme o login

Verificar Logs
Local: Verifique console do navegador (F12 → Console)

Vercel: Dashboard → Deployments → Logs

📊 CHECKLIST DE MIGRAÇÃO COMPLETA
text
Google Cloud:
☐ Projeto "novocarrosaas" criado
☐ Tela de consentimento OAuth configurada
☐ Credenciais OAuth 2.0 Web criadas
☐ ID do Cliente copiado
☐ Segredo do Cliente copiado
☐ URLs de callback adicionadas

Supabase:
☐ Google OAuth habilitado
☐ ID do Cliente Supabase atualizado
☐ Segredo do Cliente Supabase atualizado
☐ Callback URL verificado: https://nrlvchnkplruprpskclg.supabase.co/auth/v1/callback

Projeto Next.js:
☐ .env.local atualizado
☐ .env.production atualizado
☐ Supabase URL corrigida
☐ Supabase anon key corrigida

Vercel:
☐ Variáveis de ambiente adicionadas
☐ Deploy realizado
☐ Produção testada

Testes:
☐ Login local (localhost:3000) funcionando
☐ Login produção (vercel.app) funcionando
☐ Dados de usuário salvos em Supabase
🔗 LINKS RÁPIDOS
Google Cloud Console:

Credentials: https://console.cloud.google.com/apis/credentials?project=novocarrosaas

Consent Screen: https://console.cloud.google.com/apis/credentials/consent?project=novocarrosaas

Clients: https://console.cloud.google.com/auth/clients?project=novocarrosaas

Supabase Dashboard:

Auth Providers: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/auth/providers

Settings API: https://supabase.com/dashboard/project/nrlvchnkplruprpskclg/settings/api

GitHub & Vercel:

Repositório: https://github.com/fabiorjvr/novocarrosaas

Vercel Dashboard: https://vercel.com/dashboard

⚠️ TROUBLESHOOTING
Erro: "Invalid redirect_uri"

Solução: Verifique se a URL está exatamente como em Google Cloud e Supabase

Erro: "Client ID inválido"

Solução: Copie novamente do Google Cloud Console, sem espaços extras

Login não funciona em produção

Solução: Verifique se variáveis de ambiente estão corretas em Vercel

Erro: "Redirect URL não autorizada"

Solução: Adicione https://novocarrosaas.vercel.app às URLs autorizadas em Google Cloud

📝 RESUMO EXECUTIVO
Item	Valor
Projeto Supabase ID	nrlvchnkplruprpskclg
Projeto Google Cloud	novocarrosaas
URL Supabase	https://nrlvchnkplruprpskclg.supabase.co
URL Produção	https://novocarrosaas.vercel.app
Callback Supabase	https://nrlvchnkplruprpskclg.supabase.co/auth/v1/callback
Email Suporte	fabiorjvr@gmail.com
Tipo OAuth	Web Application (OAuth 2.0)
Ambiente Default	Production (Vercel)
Última atualização: 12 de janeiro de 2026
Status: Pronto para implementação
Próximo passo: Seguir Passo 1 do guia