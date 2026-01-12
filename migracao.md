GUIA COMPLETO DE MIGRAÇÃO - SUPABASE + VERCEL
Olá! Aqui está tudo que você precisa fazer para testar, validar e corrigir a migração do seu projeto para o novo repositório novocarrosaas. Acompanhe este guia passo a passo:

🔍 FASE 1: VALIDAÇÃO DO SUPABASE
✅ Teste 1: Verificar Conexão com Supabase
No repositório novocarrosaas, verifique se as variáveis de ambiente estão configuradas:

bash
# Verificar arquivo .env.local
NEXT_PUBLIC_SUPABASE_URL=https://elnnnkteevvkpahriiqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rrMMsGWSSyjCaunUjPc7Cg_Phcryg62
Testar conectividade em desenvolvimento:

bash
npm install
npm run dev
No seu código, adicione um teste simples para validar a conexão:

typescript
// app/page.tsx ou uma rota de teste
import { createClient } from '@supabase/supabase-js'

export default async function TestConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  const { data, error } = await supabase.from('seu_tabela').select('count(*)', { count: 'exact' })
  
  return (
    <div>
      {error ? <p>❌ Erro: {error.message}</p> : <p>✅ Conectado ao Supabase!</p>}
    </div>
  )
}
✅ Teste 2: Validar Dados no Supabase
Acesse o Supabase Dashboard

Vá para Table Editor e verifique:

✅ Se todas as tabelas foram migradas do projeto antigo

✅ Se os dados estão corretos e completos

✅ Se as RLS (Row Level Security) policies estão configuradas

Se as tabelas estão vazias, você precisa:

Exportar dados do projeto antigo (carroclaude)

Importar no novo projeto (novocarrosaas)

bash
# Para exportar dados:
# 1. Acesse: https://supabase.com/dashboard/project/elnnnkteevvkpahriiqx/editor
# 2. Clique em cada tabela → More → Export as CSV
# 3. Salve os arquivos
✅ Teste 3: Validar Autenticação
Se sua app usa Supabase Auth:

typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Testar sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
})
Verifique se os usuários aparecem em Authentication → Users no dashboard

🚀 FASE 2: VALIDAÇÃO DO VERCEL
✅ Teste 4: Verificar Environment Variables
Acesse Vercel Project Settings

Confirme que existem:

NEXT_PUBLIC_SUPABASE_URL = https://elnnnkteevvkpahriiqx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_rrMMsGWSSyjCaunUjPc7Cg_Phcryg62

Se faltar alguma variável, adicione manualmente:

Settings → Environment Variables → Create new

Preencha Key e Value

Clique Save

✅ Teste 5: Corrigir Build Errors
PROBLEMA ATUAL: O build está falhando com erro:

text
Error: Failed to collect page data for /api/admin/impersonate
Command "npm run build" exited with 1
SOLUÇÃO - Siga estes passos:

Identifique o arquivo problemático:

Abra app/api/admin/impersonate/route.ts (ou similar)

Verifique o código - procure por:

typescript
// ❌ PROBLEMA: Fazendo chamadas externas durante static generation
export async function GET(req: Request) {
  const data = await fetch('https://algum-api.com') // ERRO!
}

// ✅ SOLUÇÃO: Fazer apenas operações sincronizadas
export async function GET(req: Request) {
  // Usar apenas lógica local ou database queries
}
Se a rota não é essencial, desabilite-a temporariamente:

typescript
// app/api/admin/impersonate/route.ts
export const dynamic = 'force-dynamic' // Isso evita erro no build
Se precisa dessa rota, refatore para:

typescript
// ✅ Versão corrigida
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const body = await req.json()
    // sua lógica aqui
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
✅ Teste 6: Fazer Deploy Novamente
Depois de corrigir os erros, acesse Vercel Deployments

Clique Redeploy no último deployment

Status esperado: ✅ Ready (verde)

🧹 FASE 3: ORGANIZAR E LIMPAR
✅ Passo 1: Estrutura do Repositório
text
novocarrosaas/
├── app/                    # Next.js app directory
├── components/             # Componentes React
├── lib/                    # Utilitários e helpers
├── public/                 # Arquivos estáticos
├── supabase/
│   ├── migrations/         # Migrações de banco
│   ├── seed.sql           # Script de seed (dados iniciais)
│   └── schema.sql         # Schema do banco
├── .env.local             # Variáveis locais (NÃO comitar!)
├── .env.example           # Template (COMITAR!)
├── .gitignore             # Ignorar .env, node_modules, etc
└── README.md              # Documentação do projeto
✅ Passo 2: Criar .env.example
bash
# .env.example (COMITAR NO GIT)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key_aqui
# ... outras variáveis públicas
✅ Passo 3: Atualizar .gitignore
bash
# .gitignore
.env
.env.local
.env.local.backup
.env.*.local
node_modules/
.next/
dist/
build/
*.log
.DS_Store
✅ Passo 4: Criar arquivo MIGRATION.md
Documente a migração:

text
# Migração novocarrosaas

## Resumo
- **Data**: 12 de Janeiro de 2026
- **De**: github.com/fabiorjvr/carrosaas
- **Para**: github.com/fabiorjvr/novocarrosaas
- **Supabase Antigo**: Project ID: elnnnkteevvkpahriiqx
- **Supabase Novo**: Project ID: nrlvchnkplruprpskclg

## Status
- [x] Repositório criado
- [x] Variáveis de ambiente configuradas no Vercel
- [ ] Dados migrados do banco antigo
- [ ] Build funcionando 100%
- [ ] Testes de integração passando

## Checklist de Testes
- [ ] Conexão Supabase funciona
- [ ] Autenticação funciona
- [ ] Deploy no Vercel bem-sucedido
- [ ] Todas as rotas respondendo corretamente
✅ CHECKLIST FINAL
Antes de considerar a migração 100% completa, valide:

Supabase
 Database conectando corretamente

 Todas as tabelas presentes

 Dados migrados (ou seed script funcionando)

 RLS policies ativas

 Autenticação funcionando (se aplicável)

Vercel
 Environment Variables configuradas

 Build passando (Status: Ready ✅)

 Deploy bem-sucedido

 URL da aplicação acessível

 Performance aceitável (Speed Insights)

Código
 Nenhum erro nos Build Logs

 Testes passando (se tiver)

 README.md atualizado

 .env.example criado

 Documentação de migração completa

Organização
 Estrutura de pastas limpa

 .gitignore correto

 Sem credenciais no repositório

 Comments explicativos no código crítico

🆘 TROUBLESHOOTING
Problema: Build falha com erro de API
Solução: Adicione export const dynamic = 'force-dynamic' na rota problemática

Problema: Supabase retorna 401 Unauthorized
Solução: Verifique se a chave ANON_KEY está correta e não expirou

Problema: Vercel diz "Environment Variables Changed"
Solução: Faça um novo Redeploy clicando em "Redeploy" na página de deployments

Problema: Dados não aparecem
Solução: Verifique se os dados foram migrados corretamente do banco antigo

📞 Próximos Passos
Execute este guia passo a passo

Documente qualquer problema encontrado

Corrija os erros conforme indicado

Valide com o checklist final

Após tudo passar, você pode descontinuar o projeto antigo (carrosaas)

Boa migração! 🚀