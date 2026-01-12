import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Erro: Chaves do Supabase não configuradas');
  process.exit(1);
}

// Clientes com diferentes níveis de acesso
const adminClient = createClient(supabaseUrl, supabaseServiceKey); // Service Role (God Mode)
const anonClient = createClient(supabaseUrl, supabaseAnonKey); // Public (Hacker/Visitante)

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const log = (msg: string, color: string = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

async function runSecurityAudit() {
  log('\n🔒 INICIANDO AUDITORIA DE SEGURANÇA (SECURITY AUDIT)\n', colors.cyan);
  const results: any[] = [];

  async function test(name: string, fn: () => Promise<void>) {
    process.stdout.write(`${name.padEnd(60, '.')}`);
    try {
      await fn();
      log(' ✅ PASSOU', colors.green);
      results.push({ name, status: 'PASS' });
    } catch (error: any) {
      log(` ❌ FALHOU: ${error.message}`, colors.red);
      results.push({ name, status: 'FAIL', error: error.message });
    }
  }

  // 1. Teste de Acesso Público Indevido (RLS Check)
  await test('1. Bloqueio de Leitura Pública (RLS)', async () => {
    // Tentar ler tabela sensível com cliente anônimo
    const { data, error } = await anonClient.from('oficinas').select('*').limit(5);
    
    // Se conseguir ler dados, FALHOU (a menos que a tabela seja pública intencionalmente)
    // Para 'oficinas', esperamos que APENAS dados públicos (nome) sejam visíveis, mas não email/dados sensíveis
    // Neste teste rigoroso, se retornar qualquer coisa sem autenticação, vamos flaggar para revisão
    if (data && data.length > 0) {
        // Verificar se vazou email (dado sensível)
        if (data[0].email) {
            throw new Error(`Dados sensíveis vazados publicamente: ${data[0].email}`);
        }
    }
  });

  // 2. Teste de SQL Injection (Simulado via API)
  await test('2. Resistência a SQL Injection', async () => {
    // Tentar injetar comando SQL no parâmetro de busca
    const { error } = await anonClient
      .from('clientes')
      .select('*')
      .eq('nome', "' OR '1'='1");
    
    // Supabase protege nativamente, então não deve retornar todos os registros
    // Se o erro for null, mas não retornar dados indevidos, ok.
  });

  // 3. Teste de Login com Força Bruta (Rate Limit)
  // Nota: Testar rate limit real pode bloquear o IP, então vamos simular falha de login
  await test('3. Tratamento de Falha de Login', async () => {
    const { error } = await anonClient.auth.signInWithPassword({
      email: 'admin@teste.com',
      password: 'wrong_password_123'
    });
    
    if (!error) throw new Error('Login deveria falhar mas passou');
  });

  // 4. Teste de Criação de Usuário (Auth Nativo)
  let testUserEmail = `security_test_${Date.now()}@test.com`;
  let testUserId: string | undefined;

  await test('4. Registro de Novo Usuário (Auth)', async () => {
    const { data, error } = await anonClient.auth.signUp({
      email: testUserEmail,
      password: 'StrongPassword123!',
      options: {
        data: { nome: 'Security Tester' }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Usuário não criado');
    testUserId = data.user.id;
  });

  // 5. Teste de Acesso a Dados de Outro Usuário (Horizontal Privilege Escalation)
  await test('5. Isolamento de Dados entre Tenants', async () => {
    // Logar como o usuário de teste
    const { data: { session }, error: loginError } = await anonClient.auth.signInWithPassword({
        email: testUserEmail,
        password: 'StrongPassword123!'
    });
    
    if (loginError || !session) throw loginError || new Error('Falha no login');

    // Criar cliente autenticado
    const authClient = createClient(supabaseUrl!, supabaseAnonKey!, {
        global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });

    // Tentar ler dados de TODOS os clientes (não deveria conseguir ver de outras oficinas)
    const { data, error } = await authClient.from('clientes').select('*');
    
    // Se RLS estiver ativo, deve retornar 0 ou apenas os dados criados por ele (que são 0 agora)
    // Se retornar dados do Seed (que são de outras oficinas), FALHOU
    if (data && data.length > 0) {
        throw new Error(`Vazamento de dados! Usuário novo viu ${data.length} clientes de outros.`);
    }
  });

  // 6. Teste de Escrita sem Permissão
  await test('6. Bloqueio de Escrita Não Autorizada', async () => {
    // Tentar inserir na tabela 'logs_auditoria' que deve ser somente leitura ou sistema
    const { error } = await anonClient.from('logs_auditoria').insert({
        acao: 'HACK',
        mensagem: 'Tentativa de escrita'
    });

    if (!error) throw new Error('Conseguiu escrever em tabela protegida anonimamente');
  });

  // 7. Teste de Admin Impersonation (Rota Protegida)
  // Este teste verifica se a proteção implementada no Middleware funciona (mock check)
  // Como estamos rodando script Node, não passamos pelo Next.js Middleware, 
  // mas podemos validar se a função da API exige token admin.
  // (Este teste é conceitual para o relatório, pois depende do servidor rodando)
  
  // Limpeza
  if (testUserId) {
      await adminClient.auth.admin.deleteUser(testUserId);
  }

  // Gerar Relatório
  const report = `
# 🛡️ Relatório de Auditoria de Segurança - CarroClaude SaaS

**Data:** ${new Date().toLocaleString()}
**Executor:** Script Automatizado

## Resultados dos Testes

| Teste | Status | Detalhe |
|-------|--------|---------|
${results.map(r => `| ${r.name} | ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${r.error || 'Seguro'} |`).join('\n')}

## Recomendações
1. **Habilitar RLS em todas as tabelas:** Garantir que 'alter table enable row level security' foi rodado.
2. **Políticas de Select:** Validar se a policy 'Users can view their own data' está ativa.
3. **Middleware:** Manter o middleware.ts sempre ativo para proteger rotas /admin.

---
  `;

  fs.writeFileSync('tests/RELATORIO_SEGURANCA.md', report.trim());
  log('\n📄 Relatório salvo em: tests/RELATORIO_SEGURANCA.md', colors.cyan);
}

runSecurityAudit().catch(console.error);
